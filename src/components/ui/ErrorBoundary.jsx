import { Component } from "react";
import { LuRefreshCw, LuTriangleAlert } from "react-icons/lu";
import { reportClientError } from "../../lib/monitoring";
import { Container } from "./Container";
import { TacticalCard } from "./TacticalCard";

/**
 * Filet de sécurité : si une page plante, on affiche un écran propre (au lieu d'une
 * page blanche) et l'erreur est signalée à l'équipe. Changer de page efface l'erreur.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    reportClientError(error);
  }

  componentDidUpdate(previous) {
    if (this.state.error && previous.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <Container className="py-32">
        <TacticalCard highlight cut={28} innerClassName="mx-auto max-w-xl p-8 text-center sm:p-12">
          <LuTriangleAlert aria-hidden className="mx-auto h-10 w-10 text-gold" />
          <h1 className="mt-5 font-display text-4xl font-black uppercase leading-none sm:text-5xl">Petit accroc</h1>
          <p className="mt-4 text-sm text-white/60">
            Cette page a rencontré un problème. L&apos;équipe a été prévenue automatiquement. Recharge la page pour reprendre où tu en étais.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="clip-slant mt-8 inline-flex items-center gap-2 bg-gold px-6 py-3 font-display text-base font-black uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gold-light"
          >
            <LuRefreshCw aria-hidden className="h-4 w-4" />
            Recharger la page
          </button>
        </TacticalCard>
      </Container>
    );
  }
}
