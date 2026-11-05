/**
 * Icon – thin wrapper around lucide-react that maps Material Symbols
 * names (used throughout the codebase) to SVG icon components.
 * Zero web-font dependency; icons are inline SVG.
 */
import {
  Recycle, Calculator, Truck, Droplets, Leaf, Banknote, BadgeCheck,
  Menu, X, Phone, Mail, MapPin, ArrowRight, ArrowLeft, Check, Zap,
  Maximize2, Shuffle, Package, Palette, Home, Store, GraduationCap,
  PartyPopper, FlaskConical, ShieldCheck, Users, Building2, Hotel,
  Building, Music, Star, Clock, Receipt, BarChart3, Activity, Scale,
  LogOut, Search, Waves, Play, Pause, PlusCircle, Download, CheckCircle2,
  KeyRound, Lock, LogIn, Smartphone, Eye, EyeOff, Timer, AlertCircle,
  RefreshCw, ChevronLeft, ChevronRight, TrendingUp, Hash, Weight,
  FileText, Settings, Gauge, Info, Trash2, Edit, ExternalLink,
  type LucideProps,
} from 'lucide-react'
import type { FC } from 'react'

// Map Material Symbols names → Lucide components
const ICON_MAP: Record<string, FC<LucideProps>> = {
  recycling: Recycle,
  calculate: Calculator,
  local_shipping: Truck,
  water_drop: Droplets,
  eco: Leaf,
  payments: Banknote,
  verified: BadgeCheck,
  verified_user: ShieldCheck,
  menu: Menu,
  close: X,
  phone: Phone,
  mail: Mail,
  location_on: MapPin,
  arrow_forward: ArrowRight,
  arrow_back: ArrowLeft,
  check: Check,
  bolt: Zap,
  open_in_full: Maximize2,
  shuffle: Shuffle,
  inventory_2: Package,
  palette: Palette,
  home: Home,
  store: Store,
  school: GraduationCap,
  celebration: PartyPopper,
  science: FlaskConical,
  family_restroom: Users,
  mosque: Building2,
  hotel: Hotel,
  business: Building,
  festival: Music,
  star: Star,
  schedule: Clock,
  receipt_long: Receipt,
  analytics: BarChart3,
  sensors: Activity,
  scale: Scale,
  logout: LogOut,
  search: Search,
  vibration: Waves,
  balance: Scale,
  play_arrow: Play,
  pause: Pause,
  add_circle: PlusCircle,
  download: Download,
  check_circle: CheckCircle2,
  key: KeyRound,
  lock: Lock,
  login: LogIn,
  smartphone: Smartphone,
  visibility: Eye,
  visibility_off: EyeOff,
  timer: Timer,
  alert_circle: AlertCircle,
  refresh: RefreshCw,
  chevron_left: ChevronLeft,
  chevron_right: ChevronRight,
  trending_up: TrendingUp,
  hash: Hash,
  weight: Weight,
  file_text: FileText,
  settings: Settings,
  gauge: Gauge,
  info: Info,
  delete: Trash2,
  edit: Edit,
  open_in_new: ExternalLink,
  // aliases
  'progress_activity': RefreshCw,
  'local-shipping': Truck,
  'check-circle': CheckCircle2,
}

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: string
  /** Size override in pixels (default 16) */
  size?: number
}

export function Icon({ name, size = 16, className = '', ...rest }: IconProps) {
  const Component = ICON_MAP[name] ?? Info
  return <Component size={size} className={className} strokeWidth={1.75} {...rest} />
}

export default Icon

