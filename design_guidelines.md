# Design Guidelines: SEEDF ESP Automation System

## Design Approach
**Government Institutional System** - This is an official government application for SEEDF (Secretaria de Estado de Educação do Distrito Federal). The design follows strict institutional branding guidelines with mandated colors, accessibility standards, and formal governmental presentation.

## Core Design Elements

### A. Color Palette (Institutional - Mandatory)
**Official SEEDF Colors:**
- **Primary Blue**: `#0361ad` - Headers, backgrounds, primary actions
- **Institutional Yellow**: `#fae947` - Accent strips, hover states, highlights
- **White**: `#ffffff` - Content backgrounds, text on dark
- **Black**: `#000000` - Text on light backgrounds

**Accessibility Compliance:**
- Blue on White: 9.6:1 contrast (WCAG AA compliant)
- Yellow on Black: 13.5:1 contrast (WCAG AA compliant)
- All text must meet minimum contrast ratios

### B. Typography
- Use Next.js font optimization with professional sans-serif
- Hierarchy: Clear distinction between headings, body text, and labels
- Institutional tone: Formal, clear, authoritative
- Size scale: Minimum 16px for body text (accessibility)

### C. Layout System
**Spacing:** Consistent Tailwind units - primarily `p-4`, `p-6`, `p-8`, `gap-4`, `gap-6`

**Structure:**
- Fixed institutional header across all authenticated pages
- Full-width color blocks for public pages
- Centered content panels (max-w-md to max-w-4xl depending on context)
- Clear visual hierarchy with institutional color blocks

### D. Component Library

**Headers:**
- **Public Pages**: Divided header with GDF logo center, blue background, thin yellow divider strip below
- **Authenticated Pages**: Blue background with logo left, user info center-right, notifications and logout right, thin yellow strip divider

**Buttons:**
- **Primary**: Blue background (#0361ad), white text, rounded corners
- **Primary Hover**: Yellow background (#fae947), black text transition
- **Secondary**: White background with blue border and text
- **Icon Buttons**: Outlined style with proper ARIA labels

**Forms:**
- White panels on blue backgrounds
- Clear label-input hierarchy
- Password fields with show/hide toggle icon
- Select dropdowns for role selection (ARQUITETO, CHEFE DE NÚCLEO, GERENTE, DIRETOR)
- Validation feedback using Zod with clear error messages
- Focus states: Yellow outline for keyboard navigation

**Navigation:**
- Vertical tab menu for ESP editor (15 sections)
- Active tab: Yellow highlight or indicator
- Breadcrumb-style "Voltar" (back) buttons
- Clear action buttons: "Salvar", "Atualizar", "Abrir PDF"

**File Upload:**
- Drag-and-drop zone with dashed border
- Yellow border on active drag state
- Clear upload instructions and file type indicators
- Progress feedback for uploads
- Integration with MongoDB GridFS

**Data Display:**
- Clean table/card layouts for document listing
- Metadata display: identifier, description, author, date
- Action buttons per item: Visualizar, Editar, Baixar PDF
- Empty states: "Nenhum CADERNO encontrado" with create action

**Notifications:**
- Toast notifications using Sonner
- Bell icon in header for notifications
- Subtle, non-intrusive positioning

### E. Page-Specific Designs

**Landing Page (/):**
- Three-column color block: Blue-Yellow-Blue
- Central blue panel with GDF logo and "SEEDF" institutional text
- Yellow bottom strip with "Entrar" button and "REGISTRAR" link
- No scrolling - single viewport design
- Institutional, formal presentation

**Authentication Pages (/login, /register, /recover):**
- Consistent header: Blue bar with centered GDF logo, thin yellow divider
- Full blue background
- White centered panel (max-w-md) with forms
- Clear form hierarchy and spacing
- Links and secondary actions in subtle styling

**Loading Transition (/loading):**
- Full blue background
- Centered "Entrando" message
- Custom spinner with blue/yellow institutional colors
- GDF logo in footer
- 1-2 second transition before redirect

**Dashboard (/dashboard):**
- Fixed institutional header
- Action bar: "Visualizar Histórico", "+ Criação de Itens", "Novo Caderno", "Nova ESP"
- Filter section: Search by name/code, date picker, author, status dropdown
- Results area: Empty state messaging or document list
- Clean grid/list layout for items

**ESP Editor (Tabbed Interface):**
- Fixed header with back navigation
- Left sidebar with 15 tab sections
- Active tab highlighted in yellow
- Main content area for each section
- Right-side action buttons: Salvar, Atualizar, Abrir PDF
- Section-specific layouts (forms, upload zones, rich text editors)

## Accessibility Requirements
- **WCAG AA Compliance**: All color combinations meet minimum contrast
- **Keyboard Navigation**: Tab order follows logical flow, visible focus indicators (yellow outline)
- **ARIA Labels**: All interactive elements properly labeled for screen readers
- **Form Labels**: Explicit associations between labels and inputs
- **Focus Management**: Logical tab sequence, skip links where appropriate
- **Screen Reader**: Descriptive text for all icons and actions

## Images & Visual Assets
**Icons:** Lucide React library throughout
**Logo:** GDF (Governo do Distrito Federal) institutional logo - prominent placement in headers
**No Hero Images:** This is a utility-focused government system - no decorative hero imagery
**Document Previews:** PDF viewer using @react-pdf-viewer for in-app preview
**Upload Interface:** Visual drag-and-drop zone with icon indicators

## Animations
**Minimal and Purposeful:**
- Loading spinner during transition
- Smooth page transitions (fade)
- Button hover state transitions (background color)
- Toast slide-in animations
- No decorative or distracting animations

## Responsive Considerations
- Mobile-first approach with breakpoints
- Stacked layouts on mobile (forms, action buttons)
- Horizontal scrolling for wide tables on mobile
- Accessible touch targets (minimum 44px)
- Adaptive header for smaller screens