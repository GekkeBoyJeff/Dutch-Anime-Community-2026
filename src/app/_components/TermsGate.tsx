'use client';

import { useEffect, useState, type ReactNode } from 'react';

import Alert from '@/components/basics/Alert';
import Button from '@/components/basics/Button';
import Container from '@/components/basics/Container';
import Spinner from '@/components/basics/Spinner';
import Title from '@/components/basics/Title';
import Checkbox from '@/components/forms/Checkbox';
import { useSession } from '@/lib/auth/permissions';
import { getBrowserClient } from '@/lib/supabase/client';

// Bump wanneer de voorwaarden inhoudelijk wijzigen → iedereen accepteert opnieuw.
export const TERMS_VERSION = '2026-07-17';

type TermsGateProps = { children: ReactNode };

// Module-scope cache (UX only). RouteReveal re-keys this gate on every dashboard navigation, so without
// it the accepted-check would re-run from scratch and flash a spinner each hop. Keyed by user id so a
// different account never reads a stale value; a sign-out leaves it (the signed-out branch ignores it).
let acceptedCache: { userId: string; accepted: boolean } | null = null;

// Client-side gate: een ingelogde user moet de (huidige versie van de) voorwaarden accepteren voordat de
// beveiligde schermen (dashboard/account) bruikbaar zijn. Niet-ingelogd → laat downstream-guards het
// afhandelen. De publieke site rendert deze gate niet. De self-update-policy op profiles staat het
// wegschrijven van terms_accepted_at/terms_version toe.
const TermsGate = ({ children }: TermsGateProps) => {
	const { session, loading } = useSession();
	const [accepted, setAccepted] = useState<boolean | null>(() => (session && acceptedCache?.userId === session.user.id ? acceptedCache.accepted : null));
	const [agreed, setAgreed] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (loading || !session) return;
		let active = true;
		getBrowserClient()
			.from('profiles')
			.select('terms_accepted_at, terms_version')
			.eq('id', session.user.id)
			.maybeSingle()
			.then(({ data }) => {
				if (!active) return;
				const value = Boolean(data?.terms_accepted_at) && data?.terms_version === TERMS_VERSION;
				acceptedCache = { userId: session.user.id, accepted: value };
				setAccepted(value);
			});
		return () => {
			active = false;
		};
	}, [loading, session]);

	const accept = async () => {
		if (!session || !agreed) return;
		setSaving(true);
		const { error: err } = await getBrowserClient()
			.from('profiles')
			.update({ terms_accepted_at: new Date().toISOString(), terms_version: TERMS_VERSION })
			.eq('id', session.user.id);
		setSaving(false);
		if (err) {
			setError(err.message);
			return;
		}
		acceptedCache = { userId: session.user.id, accepted: true };
		setAccepted(true);
	};

	// Niet-ingelogd → downstream-guards handelen auth af; wél ingelogd maar nog aan het ophalen → spinner.
	if (loading) return <Container className="terms-gate"><Spinner label="Laden" /></Container>;
	if (!session) return <>{children}</>;
	if (accepted === null) return <Container className="terms-gate"><Spinner label="Laden" /></Container>;
	if (accepted) return <>{children}</>;

	return (
		<Container className="terms-gate">
			<div className="terms-gate-card">
				<Title element="h1" size={3} value="Voorwaarden" />
				<p>
					Om de beheer- en accountomgeving van de Dutch Anime Community te gebruiken vragen we je akkoord. We houden
					gegevens bij die nodig zijn om de community en conventies te organiseren:
				</p>
				<ul className="terms-gate-list">
					<li>je Discord-profiel: gebruikersnaam, weergavenaam, avatar en of je lid bent van de server;</li>
					<li>je deelname aan conventies: aanwezigheid, shifts, meegenomen spullen en tickets;</li>
					<li>
						moderatiegegevens waar van toepassing: waarschuwingen, notities en gerelateerde profielen — bijgehouden op
						grond van gerechtvaardigd belang voor een veilige community;
					</li>
					<li>een wijzigingslogboek van beheeracties.</li>
				</ul>
				<p>Je gegevens worden niet buiten de organisatie gedeeld. Je eigen gegevens kun je inzien op je accountpagina.</p>
				<Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v)} label="Ik ga akkoord met de voorwaarden" />
				{error && <Alert variant="error">{error}</Alert>}
				<Button variant="primary" disabled={!agreed || saving} onClick={accept}>
					Accepteren
				</Button>
			</div>
		</Container>
	);
};

export default TermsGate;
