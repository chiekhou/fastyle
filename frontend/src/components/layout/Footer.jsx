import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";

const SnapchatIcon = ({ size = 18, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12.166 2.43c-2.7 0-5.204 1.688-5.204 4.845 0 .437.066.961.066.961s-.729-.054-1.165-.054c-.525 0-.917.2-.917.634 0 .354.306.593.765.693 1.287.285 1.75 1.19 2.365 2.307.066.12.1.163.1.218 0 .054-.033.108-.066.163-.196.392-.567.688-1.132.84-.142.04-.3.065-.448.065-.165 0-.328-.025-.49-.065-.338-.087-.665-.196-.98-.196-.348 0-.687.12-.687.49 0 .608.883.937 1.544 1.087.148.033.295.054.443.054.261 0 .513-.04.76-.109.294-.08.566-.163.838-.163.567 0 .862.25.862.862 0 .098-.016.196-.033.295-.196 1.089-.882 1.862-2.385 2.08-.557.082-1 .49-1 .982 0 .098.022.196.065.283.142.295.59.447 1.087.447.414 0 .86-.098 1.305-.25.785-.26 1.522-.39 2.263-.39.443 0 .883.05 1.295.152-.294.512-.447 1.087-.447 1.697 0 1.327.82 2.573 2.067 3.162.392.196.818.295 1.245.295s.854-.099 1.245-.295c1.246-.59 2.067-1.835 2.067-3.162 0-.61-.152-1.185-.447-1.697.412-.102.852-.152 1.295-.152.74 0 1.478.13 2.263.39.446.152.891.25 1.305.25.497 0 .945-.152 1.087-.447.043-.087.065-.185.065-.283 0-.492-.443-.9-1-.982-1.503-.218-2.189-.991-2.385-2.08-.017-.099-.033-.197-.033-.295 0-.612.295-.862.862-.862.272 0 .544.083.838.163.247.069.499.109.76.109.148 0 .295-.021.443-.054.661-.15 1.544-.479 1.544-1.087 0-.37-.339-.49-.687-.49-.315 0-.642.109-.98.196-.162.04-.325.065-.49.065-.148 0-.306-.025-.448-.065-.565-.152-.936-.448-1.132-.84-.033-.055-.066-.109-.066-.163 0-.055.034-.098.1-.218.615-1.117 1.078-2.022 2.365-2.307.459-.1.765-.339.765-.693 0-.434-.392-.634-.917-.634-.436 0-1.165.054-1.165.054s.066-.524.066-.961C17.37 4.118 14.866 2.43 12.166 2.43z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-ink text-cream-300 mt-auto">
      <div className="container-app py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl text-ivory-100 mb-3">
              Fa<span className="text-olive-300">Style</span>
            </h3>
            <p className="text-sm text-cream-400 leading-relaxed">
              Votre espace beauté en ligne — réservez vos prestations et
              découvrez notre boutique.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-ivory-100 font-semibold mb-4 text-sm uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/services", label: "Nos prestations" },
                { to: "/boutique", label: "Boutique" },
                { to: "/reservation", label: "Réserver" },
                { to: "/avis", label: "Avis clientes" },
                { to: "/compte", label: "Mon compte" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-cream-400 hover:text-ivory-100 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-ivory-100 font-semibold mb-4 text-sm uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-cream-400">
              <li className="flex items-center gap-2">
                <Phone size={15} className="shrink-0 text-olive-300" />
                <a href="tel:+33612345678" className="hover:text-ivory-100 transition-colors">
                  +33 6 12 34 56 78
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={15} className="shrink-0 text-olive-300" />
                <a href="mailto:fatimata.sissoko0@gmail.com" className="hover:text-ivory-100 transition-colors">
                  fatimata.sissoko0@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <SnapchatIcon size={15} className="shrink-0 text-olive-300" />
                <a
                  href="https://snapchat.com/t/YeURGlEm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ivory-100 transition-colors"
                >
                  Fastyl-Jolimoi
                </a>
              </li>
            </ul>
            <div className="mt-4 text-xs text-cream-500">
              <p>Lun–Sam : 9h–19h</p>
              <p>Dim : Fermé</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-cream-500">
          <p>© {new Date().getFullYear()} FaStyle. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link
              to="/mentions-legales"
              className="hover:text-ivory-100 transition-colors"
            >
              Mentions légales
            </Link>
            <Link to="/cgv" className="hover:text-ivory-100 transition-colors">
              CGV
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
