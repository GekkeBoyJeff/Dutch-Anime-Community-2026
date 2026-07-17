'use client';

import { useEffect, useState } from 'react';

import Button from '@/components/basics/Button';
import Content from '@/components/basics/Content';
import { getPushState, pushSupported, subscribePush, unsubscribePush } from '@/lib/push';

// "Meldingen aanzetten/uitzetten" op de accountpagina. Toont niets als de browser geen push ondersteunt of
// er geen VAPID-sleutel is geconfigureerd. Inline feedback (de accountpagina heeft geen toast-provider).
const PushToggle = () => {
	const [supported, setSupported] = useState(false);
	const [on, setOn] = useState(false);
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		// Capaciteit pas ná mount bepalen (SSR kent geen window); setState in de async-callback i.p.v.
		// synchroon in de effect-body.
		getPushState().then((state) => {
			if (!active) return;
			setSupported(pushSupported());
			setOn(state);
		});
		return () => {
			active = false;
		};
	}, []);

	if (!supported) return null;

	const toggle = async () => {
		setBusy(true);
		setMessage(null);
		try {
			if (on) {
				const result = await unsubscribePush();
				if (!result.ok) {
					setMessage(result.error ?? 'Kon meldingen niet uitzetten.');
					return;
				}
				setOn(false);
				setMessage('Meldingen staan uit.');
			} else {
				const result = await subscribePush();
				if (!result.ok) {
					setMessage(result.error ?? 'Kon meldingen niet aanzetten.');
					return;
				}
				setOn(true);
				setMessage('Meldingen staan aan.');
			}
		} catch {
			setMessage('Er ging iets mis. Probeer het opnieuw.');
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="account-push">
			<Button variant="secondary" onClick={toggle} disabled={busy}>
				{busy ? 'Bezig…' : on ? 'Meldingen uitzetten' : 'Meldingen aanzetten'}
			</Button>
			{message && (
				<Content element="span" className="account-push-status">
					{message}
				</Content>
			)}
		</div>
	);
};

export default PushToggle;
