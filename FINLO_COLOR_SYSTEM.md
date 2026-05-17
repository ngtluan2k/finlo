# Finlo Color System

Tài liệu này chuẩn hóa bảng màu global cho dự án **Finlo** dựa trên logo hiện tại.  
Mục tiêu: dùng thống nhất cho UI, TailwindCSS, Ant Design theme, chart, trạng thái, light mode và dark mode.

---

## 1. Brand Colors

| Token                   |       Hex | Mục đích sử dụng                                                  |
| ----------------------- | --------: | ----------------------------------------------------------------- |
| `--brand-primary`       | `#015C97` | Màu thương hiệu chính, dùng cho button primary, link, active menu |
| `--brand-primary-dark`  | `#003F66` | Sidebar, header dark, trạng thái active mạnh                      |
| `--brand-primary-light` | `#54A4D7` | Hover, icon, điểm nhấn phụ                                        |
| `--brand-accent`        | `#2D82B9` | Chart, badge, highlight                                           |
| `--brand-soft`          | `#C0E8FB` | Background nhẹ, tag, empty state                                  |
| `--brand-bg`            | `#EEF8FF` | Background section nhẹ                                            |

---

## 2. Primary Scale

Dùng cho Tailwind theme, Ant Design token và trạng thái hover/active.

```css
:root {
  --color-primary-50: #eef8ff;
  --color-primary-100: #d9efff;
  --color-primary-200: #bce2ff;
  --color-primary-300: #8fd1ff;
  --color-primary-400: #54b8ff;
  --color-primary-500: #2d9cff;
  --color-primary-600: #157eff;
  --color-primary-700: #015c97;
  --color-primary-800: #003f66;
  --color-primary-900: #002b45;
}
```

### Quy ước sử dụng

| Scale         | Dùng cho                  |
| ------------- | ------------------------- |
| `primary-50`  | Background nhẹ            |
| `primary-100` | Hover background          |
| `primary-200` | Border nhẹ                |
| `primary-300` | Icon phụ                  |
| `primary-400` | Accent sáng               |
| `primary-500` | CTA phụ                   |
| `primary-600` | Hover button              |
| `primary-700` | Primary chính             |
| `primary-800` | Sidebar / active dark     |
| `primary-900` | Dark mode deep background |

---

## 3. Neutral Colors

Dùng cho text, border, background, card, table.

```css
:root {
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;
}
```

### Quy ước sử dụng

| Token      | Dùng cho           |
| ---------- | ------------------ |
| `gray-50`  | App background     |
| `gray-100` | Section background |
| `gray-200` | Border             |
| `gray-300` | Divider            |
| `gray-400` | Placeholder        |
| `gray-500` | Muted text         |
| `gray-600` | Secondary text     |
| `gray-700` | Body text          |
| `gray-800` | Heading phụ        |
| `gray-900` | Heading chính      |

---

## 4. Semantic UI Colors

```css
:root {
  --bg-body: #f5f9fc;
  --bg-card: #ffffff;
  --bg-header: #ffffff;
  --bg-sidebar: #003f66;
  --bg-hover: #eef8ff;

  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --text-inverse: #ffffff;

  --border-default: #e2e8f0;
  --border-soft: #f1f5f9;
  --border-primary: #bce2ff;
}
```

---

## 5. Status Colors

```css
:root {
  --success: #16a34a;
  --success-bg: #dcfce7;
  --success-border: #bbf7d0;

  --warning: #f59e0b;
  --warning-bg: #fef3c7;
  --warning-border: #fde68a;

  --error: #dc2626;
  --error-bg: #fee2e2;
  --error-border: #fecaca;

  --info: #0284c7;
  --info-bg: #e0f2fe;
  --info-border: #bae6fd;
}
```

---

## 6. Gradient Colors

Dùng cho logo area, hero section, card highlight, premium widget.

```css
:root {
  --gradient-primary: linear-gradient(
    135deg,
    #003f66 0%,
    #015c97 35%,
    #2d82b9 70%,
    #54a4d7 100%
  );

  --gradient-soft: linear-gradient(135deg, #54a4d7 0%, #8bc8f6 100%);

  --gradient-dark: linear-gradient(
    135deg,
    #002b45 0%,
    #003f66 45%,
    #015c97 100%
  );
}
```

---

## 7. Layout Usage

### Sidebar

| Thành phần  |                         Màu |
| ----------- | --------------------------: |
| Background  |                   `#003F66` |
| Active item |                   `#015C97` |
| Hover item  | `rgba(255, 255, 255, 0.08)` |
| Text        |                   `#FFFFFF` |
| Muted text  |                   `#C0E8FB` |

### Header

| Thành phần    |       Màu |
| ------------- | --------: |
| Background    | `#FFFFFF` |
| Border bottom | `#E2E8F0` |
| Text          | `#0F172A` |
| Icon          | `#475569` |

### Card

| Thành phần  |       Màu |
| ----------- | --------: |
| Background  | `#FFFFFF` |
| Border      | `#E2E8F0` |
| Title       | `#0F172A` |
| Description | `#64748B` |

### Button Primary

| State   |       Màu |
| ------- | --------: |
| Default | `#015C97` |
| Hover   | `#157EFF` |
| Active  | `#003F66` |
| Text    | `#FFFFFF` |

### Input

| State        |       Màu |
| ------------ | --------: |
| Border       | `#CBD5E1` |
| Focus border | `#015C97` |
| Placeholder  | `#94A3B8` |
| Text         | `#0F172A` |

---

## 8. Chart Palette

Dùng cho dashboard thống kê thu chi, ngân sách, ví, giao dịch.

```css
:root {
  --chart-1: #015c97;
  --chart-2: #2d82b9;
  --chart-3: #54a4d7;
  --chart-4: #8bc8f6;
  --chart-5: #c0e8fb;
  --chart-income: #16a34a;
  --chart-expense: #dc2626;
  --chart-budget: #f59e0b;
}
```

---

## 9. Dark Mode Tokens

```css
[data-theme="dark"] {
  --bg-body: #08131f;
  --bg-card: #0f1c2b;
  --bg-header: #0f1c2b;
  --bg-sidebar: #06111d;
  --bg-hover: #102a43;

  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --text-inverse: #0f172a;

  --border-default: #1e293b;
  --border-soft: #334155;
  --border-primary: #2d82b9;

  --brand-primary: #54a4d7;
  --brand-primary-hover: #8bc8f6;
  --brand-primary-active: #2d82b9;
}
```

---

## 10. Global CSS Variables

Khuyến nghị tạo file:

```txt
src/styles/colors.css
```

Nội dung:

```css
:root {
  --brand-primary: #015c97;
  --brand-primary-dark: #003f66;
  --brand-primary-light: #54a4d7;
  --brand-accent: #2d82b9;
  --brand-soft: #c0e8fb;
  --brand-bg: #eef8ff;

  --color-primary-50: #eef8ff;
  --color-primary-100: #d9efff;
  --color-primary-200: #bce2ff;
  --color-primary-300: #8fd1ff;
  --color-primary-400: #54b8ff;
  --color-primary-500: #2d9cff;
  --color-primary-600: #157eff;
  --color-primary-700: #015c97;
  --color-primary-800: #003f66;
  --color-primary-900: #002b45;

  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;

  --bg-body: #f5f9fc;
  --bg-card: #ffffff;
  --bg-header: #ffffff;
  --bg-sidebar: #003f66;
  --bg-hover: #eef8ff;

  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --text-inverse: #ffffff;

  --border-default: #e2e8f0;
  --border-soft: #f1f5f9;
  --border-primary: #bce2ff;

  --success: #16a34a;
  --success-bg: #dcfce7;
  --warning: #f59e0b;
  --warning-bg: #fef3c7;
  --error: #dc2626;
  --error-bg: #fee2e2;
  --info: #0284c7;
  --info-bg: #e0f2fe;

  --chart-1: #015c97;
  --chart-2: #2d82b9;
  --chart-3: #54a4d7;
  --chart-4: #8bc8f6;
  --chart-5: #c0e8fb;
  --chart-income: #16a34a;
  --chart-expense: #dc2626;
  --chart-budget: #f59e0b;

  --gradient-primary: linear-gradient(
    135deg,
    #003f66 0%,
    #015c97 35%,
    #2d82b9 70%,
    #54a4d7 100%
  );
  --gradient-soft: linear-gradient(135deg, #54a4d7 0%, #8bc8f6 100%);
  --gradient-dark: linear-gradient(
    135deg,
    #002b45 0%,
    #003f66 45%,
    #015c97 100%
  );
}
```

---

## 11. Tailwind Config

```ts
// tailwind.config.ts

export default {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#015C97",
          dark: "#003F66",
          light: "#54A4D7",
          accent: "#2D82B9",
          soft: "#C0E8FB",
          bg: "#EEF8FF",
        },
        primary: {
          50: "#EEF8FF",
          100: "#D9EFFF",
          200: "#BCE2FF",
          300: "#8FD1FF",
          400: "#54B8FF",
          500: "#2D9CFF",
          600: "#157EFF",
          700: "#015C97",
          800: "#003F66",
          900: "#002B45",
        },
      },
    },
  },
};
```

---

## 12. Ant Design Theme Token

```ts
// src/theme/antdTheme.ts

export const antdTheme = {
  token: {
    colorPrimary: "#015C97",
    colorInfo: "#2D82B9",
    colorSuccess: "#16A34A",
    colorWarning: "#F59E0B",
    colorError: "#DC2626",

    colorBgLayout: "#F5F9FC",
    colorBgContainer: "#FFFFFF",

    colorText: "#0F172A",
    colorTextSecondary: "#475569",
    colorBorder: "#E2E8F0",

    borderRadius: 12,
  },
};
```

---

## 13. Naming Convention

Không hardcode màu trực tiếp trong component.

Không nên:

```tsx
<div className="bg-[#015C97] text-white" />
```

Nên dùng:

```tsx
<div className="bg-primary-700 text-white" />
```

hoặc:

```tsx
<div style={{ backgroundColor: "var(--brand-primary)" }} />
```

---

## 14. Recommended Defaults

| Thành phần           | Token nên dùng         |
| -------------------- | ---------------------- |
| Primary Button       | `--brand-primary`      |
| Primary Button Hover | `--color-primary-600`  |
| Sidebar              | `--brand-primary-dark` |
| Active Sidebar Item  | `--brand-primary`      |
| Page Background      | `--bg-body`            |
| Card Background      | `--bg-card`            |
| Border               | `--border-default`     |
| Heading Text         | `--text-primary`       |
| Body Text            | `--text-secondary`     |
| Muted Text           | `--text-muted`         |
| Main Chart Color     | `--chart-1`            |
| Income Chart         | `--chart-income`       |
| Expense Chart        | `--chart-expense`      |
| Budget Chart         | `--chart-budget`       |
