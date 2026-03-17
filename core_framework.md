# TECHNICAL SPECIFICATION
## Core Framework + Module Nhân sự & Chấm công
### ToanERP – Tiến Oanh

---

## PHẦN 1 – CORE FRAMEWORK

---

### 1.1 Cấu trúc Project (Monorepo)

```
toanerp/
├── apps/
│   ├── api/                  # NestJS backend
│   └── web/                  # Next.js frontend
├── packages/
│   ├── database/             # Prisma schema + migrations
│   ├── shared-types/         # TypeScript types dùng chung
│   ├── event-bus/            # Internal event system
│   └── ai-context/           # AI data pipeline
├── docker-compose.yml
└── .env.example
```

---

### 1.2 Database – Shared Layer

**Nguyên tắc:** Tất cả module dùng chung một PostgreSQL instance, một Prisma schema. Không có database riêng theo module. Phân tách logic bằng namespace trong code, không tách database.

**Cấu hình kết nối:**
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/toanerp
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=http://localhost:9200
MINIO_ENDPOINT=localhost:9000
```

---

### 1.3 CORE TABLES – Nền tảng toàn hệ thống

```sql
-- ─────────────────────────────────────
-- ORGANIZATIONS
-- Multi-tenant ready (sau này có thể
-- mở rộng cho nhiều công ty)
-- ─────────────────────────────────────
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  tax_code      VARCHAR(20) UNIQUE,
  settings      JSONB DEFAULT '{}',
  -- settings chứa: timezone, currency,
  -- fiscal_year_start, logo_url,
  -- notification_channels, ai_enabled
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────
-- ROLES – Định nghĩa vai trò
-- ─────────────────────────────────────
CREATE TABLE roles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID REFERENCES organizations(id),
  name          VARCHAR(100) NOT NULL,
  slug          VARCHAR(100) NOT NULL,
  -- slug: 'director', 'manager', 'staff',
  --       'driver', 'accountant', 'auditor'
  level         INT NOT NULL,
  -- level: 1=Director, 2=Manager,
  --        3=Staff, 4=Driver, 5=Accountant
  permissions   JSONB DEFAULT '[]',
  -- permissions: ['hrm:read', 'hrm:write',
  --   'accounting:read', 'vehicle:write'...]
  is_system     BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, slug)
);

-- ─────────────────────────────────────
-- USERS – Tài khoản đăng nhập
-- ─────────────────────────────────────
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id),
  employee_id     UUID,
  -- FK đến employees, nullable khi
  -- tạo user trước khi có hồ sơ
  email           VARCHAR(255) UNIQUE NOT NULL,
  phone           VARCHAR(20),
  password_hash   VARCHAR(255) NOT NULL,
  role_id         UUID REFERENCES roles(id),
  extra_permissions JSONB DEFAULT '[]',
  -- quyền bổ sung ngoài role
  is_active       BOOLEAN DEFAULT TRUE,
  is_2fa_enabled  BOOLEAN DEFAULT FALSE,
  totp_secret     VARCHAR(255),
  last_login_at   TIMESTAMPTZ,
  last_login_ip   INET,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────
-- REFRESH TOKENS
-- ─────────────────────────────────────
CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL,
  device_info JSONB,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────
-- AUDIT LOG – Xuyên suốt toàn hệ thống
-- Không bao giờ xóa bảng này
-- ─────────────────────────────────────
CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID REFERENCES organizations(id),
  actor_id      UUID REFERENCES users(id),
  actor_name    VARCHAR(255),
  -- denormalized: lưu tên lúc đó
  -- tránh mất khi user bị xóa
  module        VARCHAR(100) NOT NULL,
  -- 'hrm', 'accounting', 'vehicle'...
  entity_type   VARCHAR(100) NOT NULL,
  entity_id     UUID NOT NULL,
  event_type    VARCHAR(100) NOT NULL,
  -- 'created', 'updated', 'deleted',
  -- 'approved', 'rejected', 'exported'
  payload_before  JSONB,
  payload_after   JSONB,
  diff            JSONB,
  -- chỉ các field thay đổi
  ip_address    INET,
  user_agent    TEXT,
  occurred_at   TIMESTAMPTZ DEFAULT NOW()
);
-- Index cho AI query và audit search
CREATE INDEX idx_audit_org_module
  ON audit_logs(org_id, module, occurred_at DESC);
CREATE INDEX idx_audit_entity
  ON audit_logs(entity_type, entity_id, occurred_at DESC);
CREATE INDEX idx_audit_actor
  ON audit_logs(actor_id, occurred_at DESC);

-- ─────────────────────────────────────
-- EVENT LOG – Cho AI và async processing
-- Khác audit_log: dành cho business events
-- ─────────────────────────────────────
CREATE TABLE event_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID REFERENCES organizations(id),
  event_type    VARCHAR(200) NOT NULL,
  -- 'trip.completed', 'employee.hired',
  -- 'invoice.paid', 'vehicle.maintenance_due'
  payload       JSONB NOT NULL,
  source_module VARCHAR(100) NOT NULL,
  correlation_id UUID,
  -- để trace một luồng nghiệp vụ
  processed_by  TEXT[],
  -- ['attendance_module', 'payroll_module']
  is_processed  BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_event_type_unprocessed
  ON event_log(event_type, is_processed, created_at)
  WHERE is_processed = FALSE;
CREATE INDEX idx_event_org_type
  ON event_log(org_id, event_type, created_at DESC);

-- ─────────────────────────────────────
-- CUSTOM FIELD DEFINITIONS
-- Dùng cho tất cả entity trong hệ thống
-- ─────────────────────────────────────
CREATE TABLE custom_field_definitions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id),
  entity_type     VARCHAR(100) NOT NULL,
  -- 'employee', 'vehicle', 'ticket_order'...
  field_key       VARCHAR(100) NOT NULL,
  field_label     VARCHAR(255) NOT NULL,
  field_type      VARCHAR(50) NOT NULL,
  -- 'text', 'number', 'currency', 'date',
  -- 'datetime', 'dropdown', 'checkbox',
  -- 'file', 'link'
  options         JSONB,
  -- cho dropdown: [{"value":"v1","label":"L1"}]
  is_required     BOOLEAN DEFAULT FALSE,
  is_visible_list BOOLEAN DEFAULT FALSE,
  is_searchable   BOOLEAN DEFAULT FALSE,
  visible_to_roles TEXT[],
  editable_by_roles TEXT[],
  section_name    VARCHAR(100),
  display_order   INT DEFAULT 0,
  validation_rules JSONB,
  -- {"min": 0, "max": 100, "regex": "..."}
  default_value   JSONB,
  is_active       BOOLEAN DEFAULT TRUE,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, entity_type, field_key)
);

CREATE TABLE custom_field_values (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID REFERENCES organizations(id),
  entity_type VARCHAR(100) NOT NULL,
  entity_id   UUID NOT NULL,
  field_key   VARCHAR(100) NOT NULL,
  value       JSONB,
  updated_by  UUID REFERENCES users(id),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_id, field_key)
);
CREATE INDEX idx_cfv_entity
  ON custom_field_values(entity_type, entity_id);

-- ─────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID REFERENCES organizations(id),
  recipient_id  UUID REFERENCES users(id),
  type          VARCHAR(100) NOT NULL,
  title         VARCHAR(255) NOT NULL,
  body          TEXT,
  data          JSONB,
  -- link, entity_type, entity_id
  channels      TEXT[],
  -- ['in_app', 'zalo', 'email']
  is_read       BOOLEAN DEFAULT FALSE,
  read_at       TIMESTAMPTZ,
  sent_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notif_recipient_unread
  ON notifications(recipient_id, is_read, created_at DESC)
  WHERE is_read = FALSE;

-- ─────────────────────────────────────
-- FILE STORAGE REGISTRY
-- Track tất cả file upload trong hệ thống
-- ─────────────────────────────────────
CREATE TABLE file_registry (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID REFERENCES organizations(id),
  uploaded_by   UUID REFERENCES users(id),
  entity_type   VARCHAR(100),
  entity_id     UUID,
  file_name     VARCHAR(500) NOT NULL,
  file_type     VARCHAR(100),
  file_size     BIGINT,
  storage_path  VARCHAR(1000) NOT NULL,
  -- path trong MinIO/S3
  public_url    VARCHAR(1000),
  is_public     BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 1.4 Auth Service – API Endpoints

```
POST   /auth/login              # Email + password → tokens
POST   /auth/login/2fa          # TOTP code → tokens
POST   /auth/refresh            # Refresh token → new access token
POST   /auth/logout             # Revoke refresh token
POST   /auth/logout/all         # Revoke all sessions
GET    /auth/me                 # Current user info + permissions
POST   /auth/change-password
POST   /auth/forgot-password
POST   /auth/reset-password
```

**JWT Access Token Payload:**
```json
{
  "sub": "user-uuid",
  "org_id": "org-uuid",
  "employee_id": "emp-uuid",
  "role": "manager",
  "role_level": 2,
  "permissions": ["hrm:read", "hrm:write", "vehicle:read"],
  "iat": 1700000000,
  "exp": 1700000900
}
```

---

### 1.5 Permission System

**Permission format:** `module:action[:resource]`

```
hrm:read                  # Đọc toàn bộ HRM
hrm:write                 # Ghi toàn bộ HRM
hrm:employee:read         # Chỉ đọc nhân viên
hrm:employee:write        # Chỉ ghi nhân viên
hrm:salary:read           # Đọc thông tin lương
hrm:salary:write          # Ghi thông tin lương
accounting:read
accounting:write
accounting:approve        # Duyệt phiếu
vehicle:read
vehicle:write
vehicle:document:write    # Upload giấy tờ xe
...
```

**Guard trong NestJS:**
```typescript
// Dùng decorator trên controller
@RequirePermissions('hrm:employee:read')
@Get('employees')
findAll() { ... }

// Hoặc check trong service
if (!user.hasPermission('hrm:salary:read')) {
  throw new ForbiddenException();
}
```

---

### 1.6 Event Bus – Internal

```typescript
// packages/event-bus/index.ts

export interface DomainEvent {
  id: string;           // UUID
  type: string;         // 'employee.hired'
  orgId: string;
  correlationId: string;
  payload: Record<string, unknown>;
  occurredAt: Date;
  sourceModule: string;
}

// Publish event
await eventBus.publish({
  type: 'employee.hired',
  orgId: org.id,
  correlationId: requestId,
  sourceModule: 'hrm',
  payload: {
    employeeId: emp.id,
    empCode: emp.emp_code,
    position: emp.position,
    startDate: emp.start_date,
  }
});

// Subscribe (trong module khác)
eventBus.subscribe('employee.hired', async (event) => {
  // knowledge module: gán tài liệu bắt buộc đọc
  // payroll module: tạo hồ sơ lương ban đầu
  // notification module: thông báo IT cấp tài khoản
});
```

**Events danh sách đầy đủ (thiết kế trước cho các module sau):**

| Event | Source | Consumers |
|-------|--------|-----------|
| employee.hired | hrm | payroll, knowledge, notification |
| employee.terminated | hrm | payroll, user(deactivate), notification |
| employee.position_changed | hrm | payroll, attendance |
| attendance.checked_in | attendance | notification |
| attendance.shift_started | attendance | cskh_ticket |
| shift.handover_completed | attendance | cskh_ticket, notification |
| trip.assigned | dispatch | attendance, notification(driver) |
| trip.completed | dispatch | attendance, accounting, vehicle(odometer), ai |
| trip.cancelled | dispatch | accounting, notification |
| vehicle.maintenance_due | vehicle | notification, dispatch(warning) |
| vehicle.document_expired | vehicle | notification, dispatch(warning) |
| invoice.paid | accounting | accounting(receipt), notification |
| loan.payment_due | accounting | notification |
| ticket_order.created | sales | accounting, cskh |
| ticket_order.refund_requested | sales | accounting, cskh |
| freight.status_changed | freight | notification(customer), cskh |
| stock.below_minimum | inventory | notification, accounting(purchase_request) |

---

### 1.7 AI Context Layer – Thiết kế từ đầu

Đây là lớp cho phép AI đọc và phân tích dữ liệu toàn hệ thống. Thiết kế ngay từ đầu để không phải refactor sau.

```typescript
// packages/ai-context/context-builder.ts

export interface AIContext {
  orgId: string;
  requestedBy: string;   // user_id
  scope: AIScope;
  dataPoints: DataPoint[];
  timeRange?: { from: Date; to: Date };
}

export interface DataPoint {
  module: string;
  entityType: string;
  entityId?: string;
  data: Record<string, unknown>;
  // Không bao gồm: password, token,
  // thông tin nhạy cảm
  metadata: {
    fetchedAt: Date;
    dataVersion: string;
  };
}

// Mỗi module đăng ký một Context Provider
export interface ModuleContextProvider {
  module: string;
  getSummary(orgId: string, timeRange?: TimeRange): Promise<ModuleSummary>;
  getEntityContext(entityId: string): Promise<EntityContext>;
  getAnomalies(orgId: string): Promise<Anomaly[]>;
  getMetrics(orgId: string): Promise<Metric[]>;
}
```

**HRM Context Provider (ví dụ):**
```typescript
class HRMContextProvider implements ModuleContextProvider {
  module = 'hrm';

  async getSummary(orgId: string) {
    return {
      total_employees: ...,
      active_employees: ...,
      on_leave_today: ...,
      pending_approvals: ...,
      contracts_expiring_30d: ...,
      turnover_rate_3m: ...,
    };
  }

  async getAnomalies(orgId: string) {
    // Phát hiện: NV chưa chấm công 3 ngày liên tiếp
    // Hợp đồng hết hạn chưa gia hạn
    // Tỷ lệ nghỉ phép bất thường
    return anomalies;
  }
}
```

**AI Query Interface:**
```typescript
// User hỏi bằng tiếng Việt tự nhiên:
// "Tháng này tài xế nào nghỉ nhiều nhất?"

// AI nhận context từ tất cả providers
// → Tự query database qua function calling
// → Trả lời có số liệu cụ thể

POST /ai/query
{
  "question": "Tháng này tài xế nào nghỉ nhiều nhất?",
  "context_modules": ["hrm", "attendance"],
  "time_range": { "from": "2025-03-01", "to": "2025-03-31" }
}
```

---

## PHẦN 2 – MODULE NHÂN SỰ (HRM)

---

### 2.1 Database Schema

```sql
-- ─────────────────────────────────────
-- DEPARTMENTS
-- ─────────────────────────────────────
CREATE TABLE departments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID REFERENCES organizations(id),
  code        VARCHAR(50) NOT NULL,
  name        VARCHAR(255) NOT NULL,
  parent_id   UUID REFERENCES departments(id),
  manager_id  UUID,
  -- FK đến employees (set sau)
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, code)
);

-- ─────────────────────────────────────
-- EMPLOYEES
-- ─────────────────────────────────────
CREATE TABLE employees (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id),
  emp_code        VARCHAR(50) NOT NULL,
  full_name       VARCHAR(255) NOT NULL,
  date_of_birth   DATE,
  gender          VARCHAR(10),
  id_card_no      VARCHAR(20),
  id_card_issued_date DATE,
  id_card_issued_place VARCHAR(255),
  phone           VARCHAR(20),
  email           VARCHAR(255),
  permanent_address TEXT,
  current_address   TEXT,
  department_id   UUID REFERENCES departments(id),
  position        VARCHAR(255),
  -- 'Tài xế', 'Phụ xe', 'NV KD', 'Kế toán'...
  employment_type VARCHAR(50),
  -- 'full_time', 'part_time', 'probation'
  start_date      DATE NOT NULL,
  end_date        DATE,
  -- null nếu đang làm
  status          VARCHAR(50) DEFAULT 'active',
  -- 'active', 'on_leave', 'terminated'
  bank_account_no VARCHAR(50),
  bank_name       VARCHAR(100),
  bank_account_holder VARCHAR(255),
  tax_code        VARCHAR(20),
  insurance_code  VARCHAR(20),
  -- BHXH
  emergency_contact_name  VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  avatar_url      VARCHAR(500),
  notes           TEXT,
  -- AI-specific: embedding vector cho
  -- semantic search nhân viên
  search_vector   TSVECTOR,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, emp_code)
);

-- Full-text search index
CREATE INDEX idx_emp_search
  ON employees USING GIN(search_vector);
-- Trigger cập nhật search_vector tự động
CREATE TRIGGER emp_search_update
  BEFORE INSERT OR UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION
  tsvector_update_trigger(
    search_vector, 'pg_catalog.simple',
    full_name, phone, emp_code, position
  );

-- ─────────────────────────────────────
-- DRIVER DETAILS
-- Thông tin riêng cho tài xế
-- ─────────────────────────────────────
CREATE TABLE driver_details (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID UNIQUE REFERENCES employees(id),
  license_no      VARCHAR(50),
  license_class   VARCHAR(20),
  -- 'B2', 'D', 'E', 'FC'...
  license_issued_date DATE,
  license_expiry_date DATE,
  license_issued_place VARCHAR(255),
  license_file_url VARCHAR(500),
  health_cert_expiry DATE,
  -- Giấy khám sức khỏe lái xe
  driving_experience_years INT,
  preferred_route VARCHAR(255),
  -- Tuyến thường chạy
  notes           TEXT
);

-- ─────────────────────────────────────
-- EMPLOYEE HISTORY – Timeline thay đổi
-- Không bao giờ update, chỉ insert
-- ─────────────────────────────────────
CREATE TABLE employee_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id   UUID REFERENCES employees(id),
  event_type    VARCHAR(100) NOT NULL,
  -- 'position_change', 'salary_change',
  -- 'department_transfer', 'status_change'
  from_value    JSONB,
  to_value      JSONB,
  effective_date DATE NOT NULL,
  reason        TEXT,
  approved_by   UUID REFERENCES users(id),
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────
-- DOCUMENT TEMPLATES
-- ─────────────────────────────────────
CREATE TABLE document_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID REFERENCES organizations(id),
  name          VARCHAR(255) NOT NULL,
  doc_type      VARCHAR(100) NOT NULL,
  -- 'labor_contract', 'decision',
  -- 'authorization', 'regulation'...
  content_html  TEXT NOT NULL,
  -- Template với {{variable}} placeholders
  variable_fields JSONB NOT NULL,
  -- [{key: "ho_ten", label: "Họ tên",
  --   source: "employee.full_name"},
  --  {key: "muc_luong", label: "Mức lương",
  --   source: "contract.salary", format: "currency"}]
  version       INT DEFAULT 1,
  is_active     BOOLEAN DEFAULT TRUE,
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────
-- DOCUMENTS ISSUED
-- ─────────────────────────────────────
CREATE TABLE documents_issued (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID REFERENCES organizations(id),
  template_id   UUID REFERENCES document_templates(id),
  employee_id   UUID REFERENCES employees(id),
  doc_code      VARCHAR(100) NOT NULL,
  -- QĐ-2025-001, HĐLĐ-2025-045
  doc_type      VARCHAR(100) NOT NULL,
  content_final TEXT NOT NULL,
  -- Nội dung đã điền đầy đủ
  file_url      VARCHAR(500),
  -- PDF đã tạo
  status        VARCHAR(50) DEFAULT 'draft',
  -- 'draft', 'pending_sign',
  -- 'signed', 'expired'
  effective_date DATE,
  expiry_date   DATE,
  signed_by     UUID REFERENCES users(id),
  signed_at     TIMESTAMPTZ,
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, doc_code)
);

-- ─────────────────────────────────────
-- LABOR CONTRACTS
-- (Extend từ documents_issued)
-- ─────────────────────────────────────
CREATE TABLE labor_contracts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID REFERENCES documents_issued(id),
  employee_id     UUID REFERENCES employees(id),
  contract_type   VARCHAR(50) NOT NULL,
  -- 'probation', 'fixed_term',
  -- 'indefinite', 'seasonal'
  start_date      DATE NOT NULL,
  end_date        DATE,
  position        VARCHAR(255) NOT NULL,
  department_id   UUID REFERENCES departments(id),
  basic_salary    DECIMAL(15,2) NOT NULL,
  allowances      JSONB DEFAULT '[]',
  -- [{type: "di_chuyen", amount: 500000}]
  probation_days  INT DEFAULT 60,
  status          VARCHAR(50) DEFAULT 'active',
  -- 'active', 'expired', 'terminated'
  terminated_at   DATE,
  termination_reason TEXT
);

-- ─────────────────────────────────────
-- LEAVE POLICIES – Chính sách nghỉ phép
-- ─────────────────────────────────────
CREATE TABLE leave_policies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id),
  leave_type      VARCHAR(100) NOT NULL,
  -- 'annual', 'sick', 'unpaid',
  -- 'maternity', 'compensatory'
  days_per_year   INT,
  max_carry_over  INT DEFAULT 0,
  requires_approval BOOLEAN DEFAULT TRUE,
  min_notice_days INT DEFAULT 1,
  applicable_to   TEXT[],
  -- ['full_time', 'driver']
  is_active       BOOLEAN DEFAULT TRUE
);

CREATE TABLE leave_balances (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id   UUID REFERENCES employees(id),
  leave_type    VARCHAR(100) NOT NULL,
  year          INT NOT NULL,
  allocated     DECIMAL(5,2) DEFAULT 0,
  used          DECIMAL(5,2) DEFAULT 0,
  carried_over  DECIMAL(5,2) DEFAULT 0,
  balance       DECIMAL(5,2) GENERATED ALWAYS AS
                (allocated + carried_over - used) STORED,
  UNIQUE(employee_id, leave_type, year)
);

CREATE TABLE leave_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id),
  employee_id     UUID REFERENCES employees(id),
  leave_type      VARCHAR(100) NOT NULL,
  from_date       DATE NOT NULL,
  to_date         DATE NOT NULL,
  total_days      DECIMAL(5,2) NOT NULL,
  reason          TEXT,
  status          VARCHAR(50) DEFAULT 'pending',
  -- 'pending', 'approved', 'rejected', 'cancelled'
  approved_by     UUID REFERENCES users(id),
  approved_at     TIMESTAMPTZ,
  reject_reason   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 2.2 HRM – API Endpoints

```
# Departments
GET    /hrm/departments
POST   /hrm/departments
PATCH  /hrm/departments/:id
DELETE /hrm/departments/:id

# Employees
GET    /hrm/employees              # List + filter + search
POST   /hrm/employees              # Tạo nhân viên mới
GET    /hrm/employees/:id          # Hồ sơ đầy đủ
PATCH  /hrm/employees/:id          # Cập nhật thông tin
GET    /hrm/employees/:id/history  # Timeline lịch sử
GET    /hrm/employees/:id/documents # Văn bản liên quan
GET    /hrm/employees/:id/contracts # Hợp đồng
GET    /hrm/employees/:id/leave-balance # Số ngày phép còn lại
POST   /hrm/employees/:id/terminate   # Nghỉ việc

# Driver details
GET    /hrm/employees/:id/driver-details
PUT    /hrm/employees/:id/driver-details

# Documents
GET    /hrm/document-templates
POST   /hrm/document-templates
GET    /hrm/documents
POST   /hrm/documents/generate     # Tạo từ template
POST   /hrm/documents/batch-generate # Tạo hàng loạt
PATCH  /hrm/documents/:id/sign

# Leave
GET    /hrm/leave-requests
POST   /hrm/leave-requests
PATCH  /hrm/leave-requests/:id/approve
PATCH  /hrm/leave-requests/:id/reject

# Custom fields
GET    /hrm/custom-fields          # Danh sách trường tùy chỉnh
POST   /hrm/custom-fields          # Tạo trường mới
PUT    /hrm/employees/:id/custom-fields # Cập nhật giá trị
```

---

## PHẦN 3 – MODULE CHẤM CÔNG

---

### 3.1 Database Schema

```sql
-- ─────────────────────────────────────
-- SHIFT DEFINITIONS – Định nghĩa ca
-- ─────────────────────────────────────
CREATE TABLE shift_definitions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID REFERENCES organizations(id),
  shift_code    VARCHAR(50) NOT NULL,
  shift_name    VARCHAR(100) NOT NULL,
  -- 'Ca sáng', 'Ca chiều', 'Ca tối'
  department    VARCHAR(100),
  -- null = áp dụng tất cả bộ phận
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  is_overnight  BOOLEAN DEFAULT FALSE,
  break_minutes INT DEFAULT 0,
  color_hex     VARCHAR(7),
  -- Màu hiển thị trên lịch
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, shift_code)
);

-- ─────────────────────────────────────
-- SHIFT ASSIGNMENTS – Phân công ca
-- ─────────────────────────────────────
CREATE TABLE shift_assignments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID REFERENCES organizations(id),
  employee_id       UUID REFERENCES employees(id),
  shift_def_id      UUID REFERENCES shift_definitions(id),
  shift_date        DATE NOT NULL,
  status            VARCHAR(50) DEFAULT 'scheduled',
  -- 'scheduled', 'in_progress',
  -- 'completed', 'absent'
  actual_start_time TIMESTAMPTZ,
  actual_end_time   TIMESTAMPTZ,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, shift_date, shift_def_id)
);
CREATE INDEX idx_shift_assign_date
  ON shift_assignments(shift_date, org_id);

-- ─────────────────────────────────────
-- SHIFT HANDOVERS – Bàn giao ca
-- ─────────────────────────────────────
CREATE TABLE shift_handovers (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                UUID REFERENCES organizations(id),
  from_shift_id         UUID REFERENCES shift_assignments(id),
  to_shift_id           UUID REFERENCES shift_assignments(id),
  from_employee_id      UUID REFERENCES employees(id),
  to_employee_id        UUID REFERENCES employees(id),
  department            VARCHAR(100) NOT NULL,
  handover_note         TEXT,
  open_tickets_count    INT DEFAULT 0,
  pending_refunds_count INT DEFAULT 0,
  pending_items         JSONB DEFAULT '[]',
  -- [{type: 'cskh_ticket', id: '...', note: '...'}]
  -- Extensible: module sau chỉ cần push vào đây
  status                VARCHAR(50) DEFAULT 'pending',
  -- 'pending', 'acknowledged', 'completed'
  acknowledged_at       TIMESTAMPTZ,
  handed_at             TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────
-- ATTENDANCE – Chấm công
-- ─────────────────────────────────────
CREATE TABLE attendance (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID REFERENCES organizations(id),
  employee_id       UUID REFERENCES employees(id),
  shift_assignment_id UUID REFERENCES shift_assignments(id),
  trip_crew_id      UUID,
  -- FK đến trip_crew (module Dispatch)
  -- null nếu là NV văn phòng
  work_date         DATE NOT NULL,
  shift_type        VARCHAR(50) NOT NULL,
  -- 'office', 'trip', 'standby'
  check_in_time     TIMESTAMPTZ,
  check_in_lat      DECIMAL(10,7),
  check_in_lng      DECIMAL(10,7),
  check_in_method   VARCHAR(50),
  -- 'gps', 'qr', 'manual', 'trip_auto'
  check_out_time    TIMESTAMPTZ,
  check_out_lat     DECIMAL(10,7),
  check_out_lng     DECIMAL(10,7),
  check_out_method  VARCHAR(50),
  scheduled_hours   DECIMAL(4,2),
  actual_hours      DECIMAL(4,2),
  overtime_hours    DECIMAL(4,2) DEFAULT 0,
  late_minutes      INT DEFAULT 0,
  early_leave_minutes INT DEFAULT 0,
  status            VARCHAR(50) DEFAULT 'present',
  -- 'present', 'absent', 'late',
  -- 'half_day', 'on_leave', 'holiday'
  leave_request_id  UUID REFERENCES leave_requests(id),
  note              TEXT,
  is_approved       BOOLEAN DEFAULT FALSE,
  approved_by       UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, work_date,
         COALESCE(trip_crew_id::text, 'office'))
);
CREATE INDEX idx_attendance_emp_date
  ON attendance(employee_id, work_date DESC);
CREATE INDEX idx_attendance_org_date
  ON attendance(org_id, work_date DESC);

-- ─────────────────────────────────────
-- PAYROLL
-- ─────────────────────────────────────
CREATE TABLE payroll_periods (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID REFERENCES organizations(id),
  period_code VARCHAR(20) NOT NULL,
  -- '2025-03'
  year        INT NOT NULL,
  month       INT NOT NULL,
  status      VARCHAR(50) DEFAULT 'open',
  -- 'open', 'calculating', 'reviewing',
  -- 'approved', 'paid'
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  paid_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, period_code)
);

CREATE TABLE payroll_records (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID REFERENCES organizations(id),
  period_id         UUID REFERENCES payroll_periods(id),
  employee_id       UUID REFERENCES employees(id),
  contract_id       UUID REFERENCES labor_contracts(id),

  -- Input từ chấm công
  work_days         DECIMAL(5,2),
  standard_days     DECIMAL(5,2),
  overtime_hours    DECIMAL(5,2),
  late_minutes      INT,

  -- Lương cơ bản
  basic_salary      DECIMAL(15,2),
  daily_rate        DECIMAL(15,2),
  hourly_rate       DECIMAL(15,2),

  -- Thu nhập
  salary_earned     DECIMAL(15,2),
  -- basic * (work_days/standard_days)
  overtime_pay      DECIMAL(15,2),
  trip_bonus        DECIMAL(15,2),
  -- Tính từ số chuyến hoàn thành
  kpi_bonus         DECIMAL(15,2),
  other_allowances  JSONB DEFAULT '[]',
  gross_income      DECIMAL(15,2),

  -- Khấu trừ
  social_insurance  DECIMAL(15,2),
  health_insurance  DECIMAL(15,2),
  unemployment_ins  DECIMAL(15,2),
  personal_income_tax DECIMAL(15,2),
  advance_deduction DECIMAL(15,2),
  -- Tạm ứng đã nhận
  penalty_deduction DECIMAL(15,2),
  other_deductions  JSONB DEFAULT '[]',
  total_deductions  DECIMAL(15,2),

  net_salary        DECIMAL(15,2),
  -- gross - total_deductions

  calculation_detail JSONB,
  -- Lưu toàn bộ công thức tính
  -- để audit và giải thích cho NV

  status            VARCHAR(50) DEFAULT 'draft',
  -- 'draft', 'confirmed', 'paid'
  paid_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(period_id, employee_id)
);

CREATE TABLE advance_salary (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID REFERENCES organizations(id),
  employee_id   UUID REFERENCES employees(id),
  amount        DECIMAL(15,2) NOT NULL,
  reason        TEXT,
  status        VARCHAR(50) DEFAULT 'pending',
  -- 'pending', 'approved', 'rejected', 'deducted'
  requested_by  UUID REFERENCES users(id),
  approved_by   UUID REFERENCES users(id),
  approved_at   TIMESTAMPTZ,
  deducted_period VARCHAR(20),
  -- '2025-03' – tháng sẽ trừ vào lương
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 3.2 Attendance – API Endpoints

```
# Shift Management
GET    /attendance/shifts              # Danh sách ca
POST   /attendance/shifts              # Tạo ca mới
GET    /attendance/shifts/schedule     # Lịch ca theo tuần/tháng

# Shift Assignments
GET    /attendance/assignments         # Phân công ca
POST   /attendance/assignments         # Phân công
POST   /attendance/assignments/bulk    # Phân công hàng loạt

# Handover
POST   /attendance/handovers           # Tạo bàn giao ca
PATCH  /attendance/handovers/:id/acknowledge # Xác nhận nhận ca
GET    /attendance/handovers/current   # Bàn giao ca hiện tại

# Check-in/out
POST   /attendance/checkin             # Check in (GPS/QR)
POST   /attendance/checkout            # Check out
POST   /attendance/checkin/trip        # Check in theo chuyến (auto)

# Records
GET    /attendance/records             # Bảng công
GET    /attendance/records/summary     # Tổng hợp theo tháng
PATCH  /attendance/records/:id         # Điều chỉnh thủ công
POST   /attendance/records/:id/approve # Duyệt bảng công

# Payroll
POST   /payroll/calculate/:period      # Tính lương kỳ
GET    /payroll/:period                # Xem bảng lương
GET    /payroll/:period/employee/:id   # Phiếu lương cá nhân
POST   /payroll/:period/approve        # Duyệt bảng lương
POST   /payroll/:period/export         # Xuất Excel/PDF

# Advance
POST   /payroll/advances               # Yêu cầu tạm ứng
PATCH  /payroll/advances/:id/approve
PATCH  /payroll/advances/:id/reject
```

---

### 3.3 Business Logic – Tính lương tài xế

```typescript
// Công thức tính lương tài xế
// Phức tạp hơn NV văn phòng vì tính theo chuyến

interface DriverPayCalculation {
  // Lương cơ bản theo ngày
  basicDailyRate: number;
  workDays: number;
  basicEarned: number; // basicDailyRate * workDays

  // Thưởng chuyến (tính từ TRIP_CREW)
  tripsCompleted: number;
  tripBonusPerTrip: number;
  isPrimaryDriver: boolean;
  // primary driver nhận 100%, secondary nhận 70%
  tripBonus: number;

  // Phụ cấp
  nightAllowance: number;  // Chuyến đêm
  longHaulAllowance: number; // Chuyến dài > X km

  // Tổng
  grossIncome: number;
}

// Ví dụ tính:
// Tài xế A, tháng 3/2025:
// - 22 ngày làm việc, lương cơ bản 200k/ngày = 4.400.000đ
// - 18 chuyến hoàn thành, là tài xế chính
//   thưởng 150k/chuyến * 100% = 2.700.000đ
// - 5 chuyến đêm: 100k/chuyến = 500.000đ
// - Gross = 7.600.000đ
// - Khấu trừ BHXH 8% = 608.000đ
// - Net = 6.992.000đ
```

---

## PHẦN 4 – EXTENSIBILITY CONTRACTS

Đây là phần quan trọng nhất: **các interface mà module sau bắt buộc phải implement** để đảm bảo tích hợp liền mạch.

---

### 4.1 Module Interface Contract

```typescript
// Mọi module mới phải implement interface này

export interface ToanERPModule {
  // Metadata
  name: string;           // 'accounting', 'vehicle'...
  version: string;
  dependencies: string[]; // Module nào cần chạy trước

  // Lifecycle
  onInit(): Promise<void>;
  onModuleReady(): Promise<void>;

  // Event Bus
  getPublishedEvents(): string[];  // Events module này phát ra
  getSubscribedEvents(): EventHandler[]; // Events module này lắng nghe

  // AI Context
  getContextProvider(): ModuleContextProvider;

  // Permissions
  getPermissions(): Permission[];

  // API Routes
  getRoutes(): RouteDefinition[];
}
```

### 4.2 Foreign Key Contracts (Loose Coupling)

Các module sau này cần tham chiếu đến HRM/Attendance nhưng không tạo hard FK qua database. Thay vào đó dùng **application-level validation:**

```typescript
// Module Dispatch cần biết employee tồn tại
// KHÔNG làm: FOREIGN KEY (driver_id) REFERENCES employees(id)
// LÀM: Validate trong service

class DispatchService {
  async assignDriver(tripId: string, employeeId: string) {
    // Gọi HRM service để validate
    const employee = await this.hrmService
      .validateEmployee(employeeId, { 
        mustBeActive: true,
        mustHavePosition: ['driver'],
        mustHaveLicense: true
      });
    
    if (!employee.isValid) {
      throw new BadRequestException(employee.reason);
    }
    // Tiến hành assign...
  }
}
```

**Lý do:** Nếu sau này tách Microservices, không bị vướng cross-DB foreign key.

### 4.3 Shared Data Access Patterns

```typescript
// Pattern: Mỗi module có Repository riêng
// nhưng dùng chung Prisma client

// HRM Module
class EmployeeRepository {
  constructor(private prisma: PrismaService) {}

  async findActiveDrivers(orgId: string) {
    return this.prisma.employees.findMany({
      where: {
        org_id: orgId,
        status: 'active',
        position: { in: ['Tài xế', 'driver'] }
      },
      include: {
        driver_details: true,
        custom_field_values: true
      }
    });
  }
}

// Dispatch Module – dùng chung Prisma
// nhưng không bypass EmployeeRepository
class DispatchRepository {
  // Chỉ query bảng của mình (trips, trip_crew)
  // Lấy thông tin employee qua EmployeeRepository
}
```

### 4.4 AI Readiness Checklist

Mỗi module khi xây dựng phải đảm bảo:

```
✅ Mọi entity đều có: id (UUID), org_id, created_at, updated_at
✅ Mọi thay đổi đều ghi vào audit_logs
✅ Mọi business event đều publish vào event_log
✅ Implement ModuleContextProvider (getSummary, getAnomalies, getMetrics)
✅ Các trường số/ngày/enum nhất quán (không dùng string cho số tiền)
✅ Soft delete: không xóa vật lý (thêm deleted_at TIMESTAMPTZ)
✅ Timestamps: luôn dùng TIMESTAMPTZ (có timezone), không dùng TIMESTAMP
✅ Decimal: dùng DECIMAL(15,2) cho tiền, không dùng FLOAT
✅ JSONB fields có schema được document rõ ràng
✅ Indexes: tất cả FK fields và các field hay filter đều có index
```

---

## PHẦN 5 – MIGRATION & SEED

### 5.1 Migration thứ tự

```
001_create_organizations
002_create_roles
003_create_users
004_create_refresh_tokens
005_create_audit_logs
006_create_event_log
007_create_custom_fields
008_create_notifications
009_create_file_registry
010_create_departments
011_create_employees
012_create_driver_details
013_create_employee_history
014_create_document_templates
015_create_documents_issued
016_create_labor_contracts
017_create_leave_policies
018_create_leave_balances
019_create_leave_requests
020_create_shift_definitions
021_create_shift_assignments
022_create_shift_handovers
023_create_attendance
024_create_payroll_periods
025_create_payroll_records
026_create_advance_salary
```

### 5.2 Seed Data – Tiến Oanh

```typescript
// Seed dữ liệu mẫu cho Tiến Oanh

const departments = [
  { code: 'BGD', name: 'Ban Giám Đốc' },
  { code: 'KD', name: 'Phòng Kinh Doanh' },
  { code: 'KT', name: 'Phòng Kế Toán' },
  { code: 'VT', name: 'Phòng Vận Tải' },
  { code: 'HCNS', name: 'Phòng Hành Chính Nhân Sự' },
  { code: 'CSKH', name: 'Tổng Đài CSKH' },
  { code: 'LAIXE', name: 'Đội Tài Xế' },
  { code: 'PHUXE', name: 'Đội Phụ Xe' },
];

const roles = [
  { slug: 'director', name: 'Giám Đốc', level: 1,
    permissions: ['*'] },
  { slug: 'manager', name: 'Trưởng Phòng', level: 2,
    permissions: ['hrm:read', 'hrm:write',
                  'attendance:read', 'attendance:write',
                  'accounting:read'] },
  { slug: 'staff', name: 'Nhân Viên', level: 3,
    permissions: ['hrm:employee:self',
                  'attendance:checkin',
                  'attendance:leave_request'] },
  { slug: 'driver', name: 'Tài Xế', level: 4,
    permissions: ['attendance:checkin',
                  'attendance:trip_view',
                  'vehicle:self_view'] },
  { slug: 'accountant', name: 'Kế Toán', level: 5,
    permissions: ['accounting:read', 'accounting:write',
                  'accounting:approve',
                  'hrm:salary:read'] },
];

const shiftDefinitions = [
  { code: 'CA_SANG', name: 'Ca Sáng',
    department: 'CSKH',
    startTime: '06:00', endTime: '14:00' },
  { code: 'CA_CHIEU', name: 'Ca Chiều',
    department: 'CSKH',
    startTime: '14:00', endTime: '22:00' },
  { code: 'CA_TOI', name: 'Ca Tối',
    department: 'CSKH',
    startTime: '22:00', endTime: '06:00',
    isOvernight: true },
  { code: 'HANH_CHINH', name: 'Hành Chính',
    department: null,
    startTime: '08:00', endTime: '17:00' },
];
```

---

## TÓM TẮT – CHECKLIST TRƯỚC KHI BUILD MODULE TIẾP THEO

Khi bắt đầu module mới (Kế toán, Phương tiện, Kinh doanh...):

```
□ Reuse bảng: organizations, users, employees,
              audit_logs, event_log, custom_field_*,
              notifications, file_registry

□ Implement ToanERPModule interface

□ Đăng ký events sẽ publish và subscribe

□ Implement ModuleContextProvider cho AI

□ Tất cả entity theo AI Readiness Checklist

□ Không tạo hard FK cross-module trong DB
  (dùng application-level validation)

□ Viết seed data cho môi trường dev/test
```
