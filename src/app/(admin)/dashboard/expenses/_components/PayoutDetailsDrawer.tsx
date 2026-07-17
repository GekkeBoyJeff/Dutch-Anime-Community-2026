'use client';

import { Toast } from '@base-ui/react/toast';
import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import Button from '@/components/basics/Button';
import Drawer from '@/components/components/Drawer';
import Field from '@/components/forms/Field';
import TextInput from '@/components/forms/TextInput';
import { getBrowserClient } from '@/lib/supabase/client';

type Props = { session: Session; open: boolean; onOpenChange: (open: boolean) => void; onSaved?: () => void };

// "Mijn uitbetaalgegevens": IBAN + tenaamstelling in de streng-gescoopte payout_details-tabel (alleen jij +
// expenses.manage kunnen 'm lezen). Eenmalig invullen; wordt voorgevuld op elk declaratieformulier.
const PayoutDetailsDrawer = ({ session, open, onOpenChange, onSaved }: Props) => {
	const toast = Toast.useToastManager();
	const [iban, setIban] = useState('');
	const [holder, setHolder] = useState('');
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		if (!open) return;
		let active = true;
		getBrowserClient()
			.from('payout_details')
			.select('iban, account_holder')
			.eq('user_id', session.user.id)
			.maybeSingle()
			.then(({ data, error }) => {
				if (!active) return;
				if (error) {
					toast.add({ title: 'Kon je gegevens niet laden', description: error.message, type: 'error' });
					return;
				}
				setIban(data?.iban ?? '');
				setHolder(data?.account_holder ?? '');
			});
		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, session]);

	const save = async () => {
		setBusy(true);
		try {
			const { error } = await getBrowserClient()
				.from('payout_details')
				.upsert({ user_id: session.user.id, iban: iban.trim() || null, account_holder: holder.trim() || null });
			if (error) {
				toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
				return;
			}
			toast.add({ title: 'Uitbetaalgegevens opgeslagen', type: 'success' });
			onSaved?.();
			onOpenChange(false);
		} finally {
			setBusy(false);
		}
	};

	return (
		<Drawer
			open={open}
			onOpenChange={onOpenChange}
			title="Mijn uitbetaalgegevens"
			description="Naar dit rekeningnummer worden je declaraties uitbetaald."
			size="30rem"
			footer={
				<>
					<Button variant="secondary" onClick={() => onOpenChange(false)}>
						Sluiten
					</Button>
					<Button variant="primary" onClick={save} disabled={busy}>
						{busy ? 'Bezig…' : 'Opslaan'}
					</Button>
				</>
			}
		>
			<div className="inventory-form">
				<Field name="iban">
					<Field.Label>IBAN</Field.Label>
					<TextInput value={iban} onChange={(e) => setIban(e.currentTarget.value)} placeholder="NL00 BANK 0000 0000 00" />
				</Field>
				<Field name="holder">
					<Field.Label>Tenaamstelling</Field.Label>
					<TextInput value={holder} onChange={(e) => setHolder(e.currentTarget.value)} placeholder="Voor- en achternaam" />
				</Field>
			</div>
		</Drawer>
	);
};

export default PayoutDetailsDrawer;
