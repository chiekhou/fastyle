export default function CGVPage() {
  return (
    <div className="animate-fade-in">
      <section className="bg-ink py-14">
        <div className="container-app text-center">
          <h1 className="font-display text-4xl text-ivory-100">Conditions Générales de Vente</h1>
          <p className="text-cream-400 mt-3 text-sm">Applicables à toutes les prestations et commandes passées sur FaStyle</p>
        </div>
      </section>

      <section className="section">
        <div className="container-app max-w-3xl space-y-10">

          <Block title="1. Objet">
            <p>
              Les présentes CGV régissent les relations entre FaStyle (ci-après "le Prestataire")
              et toute personne effectuant une réservation de prestation ou une commande de
              produit sur le site (ci-après "la Cliente").
            </p>
            <p className="mt-2">
              Toute réservation ou commande implique l'acceptation pleine et entière des
              présentes conditions.
            </p>
          </Block>

          <Block title="2. Prestations de beauté">
            <p>
              FaStyle propose des prestations de soin et de beauté réservables en ligne.
              Les tarifs affichés sont en euros TTC. Un acompte de <strong>50 %</strong> est
              requis au moment de la réservation pour confirmer le rendez-vous.
            </p>
            <p className="mt-2">
              Le solde restant est à régler directement lors de la prestation.
            </p>
          </Block>

          <Block title="3. Politique d'annulation">
            <p>
              Toute annulation effectuée <strong>plus de 48 heures</strong> avant le
              rendez-vous donne lieu au remboursement intégral de l'acompte.
            </p>
            <p className="mt-2">
              En cas d'annulation <strong>moins de 48 heures</strong> avant le rendez-vous
              ou en cas de non-présentation, l'acompte est conservé à titre d'indemnité.
            </p>
            <p className="mt-2">
              En cas d'annulation à l'initiative de FaStyle, l'acompte est intégralement
              remboursé dans un délai de 5 à 10 jours ouvrés.
            </p>
          </Block>

          <Block title="4. Produits (boutique en ligne)">
            <p>
              Les produits cosmétiques et vêtements proposés à la vente sont décrits avec
              soin. Les photographies sont non contractuelles. Les prix sont indiqués en
              euros TTC et peuvent être modifiés à tout moment.
            </p>
            <p className="mt-2">
              La commande est confirmée après paiement intégral via PayPal. FaStyle se
              réserve le droit d'annuler toute commande en cas de rupture de stock ou
              d'erreur manifeste sur le prix.
            </p>
          </Block>

          <Block title="5. Paiement">
            <p>
              Le règlement s'effectue en ligne via <strong>PayPal</strong> (carte bancaire
              acceptée via PayPal sans création de compte obligatoire).
            </p>
            <p className="mt-2">
              Les données de paiement sont traitées directement par PayPal et ne sont
              jamais stockées sur nos serveurs.
            </p>
          </Block>

          <Block title="6. Livraison (produits)">
            <p>
              Les commandes de produits sont expédiées dans un délai de <strong>2 à 5 jours
              ouvrés</strong> après confirmation du paiement. Les frais de livraison sont
              indiqués lors du passage de commande.
            </p>
            <p className="mt-2">
              En cas de colis endommagé ou manquant, contactez-nous dans les 48h suivant
              la réception à : <strong>fatimata.sissoko0@gmail.com</strong>
            </p>
          </Block>

          <Block title="7. Droit de rétractation">
            <p>
              Conformément à l'article L221-18 du Code de la Consommation, la Cliente
              dispose d'un délai de <strong>14 jours</strong> à compter de la réception du
              produit pour exercer son droit de rétractation, sans avoir à justifier sa décision.
            </p>
            <p className="mt-2">
              Le droit de rétractation ne s'applique pas aux prestations de service dont
              l'exécution a commencé avec l'accord de la Cliente avant l'expiration du
              délai de rétractation.
            </p>
            <p className="mt-2">
              Pour exercer ce droit, contactez-nous par email à :
              <strong> fatimata.sissoko0@gmail.com</strong>
            </p>
          </Block>

          <Block title="8. Responsabilité">
            <p>
              FaStyle s'engage à réaliser les prestations avec le plus grand soin et
              professionnalisme. En cas de réaction cutanée ou d'allergie, la Cliente
              est invitée à en informer FaStyle avant toute prestation.
            </p>
            <p className="mt-2">
              FaStyle ne peut être tenu responsable des dommages indirects résultant
              de l'utilisation de ses services ou produits.
            </p>
          </Block>

          <Block title="9. Litiges">
            <p>
              En cas de litige, une solution amiable sera recherchée en priorité.
              À défaut d'accord, les tribunaux français seront compétents.
            </p>
            <p>
              La Cliente peut également recourir à un médiateur de la consommation
              agréé conformément au Code de la Consommation.
            </p>
            <p className="text-sm text-ink-muted mt-2">Dernière mise à jour : avril 2025</p>
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
