export default function MentionsLegalesPage() {
  return (
    <div className="animate-fade-in">
      <section className="bg-ink py-14">
        <div className="container-app text-center">
          <h1 className="font-display text-4xl text-ivory-100">
            Mentions légales
          </h1>
          <p className="text-cream-400 mt-3 text-sm">
            Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance
            en l'économie numérique
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-app max-w-3xl space-y-10">
          <Block title="1. Éditeur du site">
            <p>
              <strong>Nom :</strong> FaStyle
            </p>
            <p>
              <strong>Responsable de publication :</strong> Fatimata Sissoko
            </p>
            <p>
              <strong>Adresse :</strong>{" "}
              <span className="text-ink-muted">[À compléter]</span>
            </p>
            <p>
              <strong>Téléphone :</strong> +33 6 12 34 56 78
            </p>
            <p>
              <strong>Email :</strong> fatimata.sissoko0@gmail.com
            </p>
            <p className="text-ink-muted text-sm mt-2">
              Activité exercée en tant qu'auto-entrepreneur / micro-entreprise.
              SIRET : <span>[82846821500029]</span>
            </p>
          </Block>

          <Block title="2. Hébergement">
            <p>
              Ce site est hébergé par un prestataire d'infrastructure (serveur
              cloud). Les coordonnées de l'hébergeur sont disponibles sur
              demande à l'adresse email de contact.
            </p>
          </Block>

          <Block title="3. Propriété intellectuelle">
            <p>
              L'ensemble des contenus présents sur le site FaStyle (textes,
              images, logos, visuels) sont la propriété exclusive de FaStyle ou
              de leurs auteurs respectifs. Toute reproduction, distribution ou
              utilisation sans autorisation préalable est interdite.
            </p>
          </Block>

          <Block title="4. Données personnelles (RGPD)">
            <p>
              Dans le cadre de la création d'un compte et de la réservation de
              prestations, FaStyle collecte les données suivantes : nom complet,
              adresse email, numéro de téléphone (optionnel).
            </p>
            <p className="mt-2">
              Ces données sont utilisées exclusivement pour la gestion des
              rendez-vous, des commandes et la communication avec la cliente.
              Elles ne sont jamais revendues à des tiers.
            </p>
            <p className="mt-2">
              Conformément au RGPD, vous disposez d'un droit d'accès, de
              rectification et de suppression de vos données. Pour exercer ce
              droit, contactez-nous à :
              <strong> fatimata.sissoko0@gmail.com</strong>
            </p>
          </Block>

          <Block title="5. Cookies">
            <p>
              Ce site utilise uniquement des cookies techniques nécessaires au
              bon fonctionnement de l'application (session, authentification).
              Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
            </p>
          </Block>

          <Block title="6. Limitation de responsabilité">
            <p>
              FaStyle s'efforce de maintenir le site accessible et à jour.
              Cependant, nous ne pouvons garantir l'absence d'interruptions ou
              d'erreurs, et déclinons toute responsabilité en cas de dommages
              résultant d'une indisponibilité du service.
            </p>
          </Block>

          <Block title="7. Droit applicable">
            <p>
              Les présentes mentions légales sont soumises au droit français. En
              cas de litige, les tribunaux français seront compétents.
            </p>
            <p className="text-sm text-ink-muted mt-2">
              Dernière mise à jour : avril 2025
            </p>
          </Block>
        </div>
      </section>
    </div>
  );
}

function Block({ title, children }) {
  return (
    <div className="card p-7">
      <h2 className="font-display text-xl text-ink mb-4">{title}</h2>
      <div className="space-y-2 text-sm text-ink-soft leading-relaxed">
        {children}
      </div>
    </div>
  );
}
