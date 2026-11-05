import { Link } from 'react-router-dom'
import { Icon } from '../ui'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-[#010f05] border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#9BE564]/20 border border-[#9BE564]/40 flex items-center justify-center">
                <Icon name="recycling" size={18} className="text-[#9BE564]" />
              </div>
              <div>
                <span className="text-white font-bold text-sm font-display tracking-wide block">RIZZL3R PET</span>
                <span className="text-[#9BE564] text-[10px] font-medium tracking-widest uppercase">Recovery · Lagos</span>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Lagos's premier PET bottle recovery and circularity platform. Connecting households, schools, hotels and corporates to a verified circular supply chain — with instant, transparent payouts.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="https://wa.me/2349069935434" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#9BE564]/20 hover:border-[#9BE564]/40 transition-colors" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white/60"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <a href="https://x.com/sikidey4u" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#9BE564]/20 hover:border-[#9BE564]/40 transition-colors" aria-label="X (Twitter)">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white/60"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="mailto:Sixtus7498@gmail.com"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#9BE564]/20 hover:border-[#9BE564]/40 transition-colors" aria-label="Email">
                <Icon name="mail" size={16} className="text-white/60" />
              </a>
            </div>
          </div>

          {/* Direct Channels */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Direct Channels</h3>
            <ul className="space-y-3">
              {[
                { icon: 'phone', text: '09069935434', href: 'tel:09069935434' },
                { icon: 'mail', text: 'Sixtus7498@gmail.com', href: 'mailto:Sixtus7498@gmail.com' },
                { icon: 'location_on', text: 'Lagos, Nigeria', href: '#' },
              ].map(item => (
                <li key={item.text}>
                  <a href={item.href} className="flex items-center gap-2 text-white/50 hover:text-[#9BE564] transition-colors text-sm">
                    <Icon name={item.icon} size={14} className="text-[#9BE564]/60 flex-shrink-0" />
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Operations */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Quick Operations</h3>
            <ul className="space-y-3 text-sm text-white/50">
              {[
                { label: 'Book a Dispatch', href: '#booking' },
                { label: 'Live Rates', href: '#rates' },
                { label: 'Payout Calculator', href: '#estimator' },
                { label: 'Admin Portal', href: '/admin/login' },
              ].map(item => (
                <li key={item.label}>
                  {item.href.startsWith('/') ? (
                    <Link to={item.href} className="hover:text-[#9BE564] transition-colors">{item.label}</Link>
                  ) : (
                    <a href={item.href} onClick={e => { e.preventDefault(); document.getElementById(item.href.slice(1))?.scrollIntoView({ behavior: 'smooth' }) }}
                      className="hover:text-[#9BE564] transition-colors cursor-pointer">{item.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">© {year} Rizzl3r PET Recovery. All rights reserved. Lagos, Nigeria.</p>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <span>Circular Economy Compliant</span>
            <span className="text-white/10">|</span>
            <span>EPR Registered</span>
            <span className="text-white/10">|</span>
            <span className="text-[#9BE564]/50">DEMO SITE</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
