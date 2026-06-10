Using Node.js 20, Tailwind CSS v3.4.19, Vite v7.3.0, and Supabase.

Tailwind CSS has been set up with the shadcn theme.
The backend has been migrated from Vercel KV/Blob to Supabase (Database & Storage).

Components (40+):
  accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb,
  button-group, button, calendar, card, carousel, chart, checkbox, collapsible,
  command, context-menu, dialog, drawer, dropdown-menu, empty, field, form,
  hover-card, input-group, input-otp, input, item, kbd, label, menubar,
  navigation-menu, pagination, popover, progress, radio-group, resizable,
  scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner,
  spinner, switch, table, tabs, textarea, toggle-group, toggle, tooltip

Usage:
  import { Button } from '@/components/ui/button'
  import { supabase } from '@/lib/supabase'

Structure:
  src/components/      UI Components & Helix Visualizer
  src/hooks/           Custom hooks (useTranscriptDB for Supabase)
  src/lib/             Library configurations (Supabase client)
  src/types/           Type definitions
  src/pages/           Page components (Student, Admin)
  src/App.tsx          Root React component with Routing & Toaster
  src/main.tsx         Entry point
  README.md            Project documentation & Supabase SQL Setup
  vercel.json          Deployment configuration for Vercel SPA routing
