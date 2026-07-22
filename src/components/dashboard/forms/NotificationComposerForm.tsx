'use client';

import { Toast } from '@base-ui/react/toast';
import { useState } from 'react';

import Button from '@/components/basics/Button';
import Content from '@/components/basics/Content';
import Switch from '@/components/components/Switch';
import Field from '@/components/forms/Field';
import Select from '@/components/forms/Select';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';

export interface ComposerMember {
	id: string;
	username: string | null;
}

export interface ComposerMessage {
	title: string;
	body: string;
	url: string;
	all: boolean;
	userIds: string[];
}

interface NotificationComposerFormProps {
	members: ComposerMember[];
	busy: boolean;
	/** Send the composed message; resolve `true` on success so the form clears its fields. */
	onSend: (message: ComposerMessage) => Promise<boolean>;
}

/**
 * The notification composer: a message card (title/body/link) and a recipients card (all-members switch
 * or a multi-select), with a send action. Owns its field state and validation; the caller performs the
 * actual delivery via `onSend` and reports success so the fields reset.
 */
const NotificationComposerForm = ({ members, busy, onSend }: NotificationComposerFormProps) => {
	const toast = Toast.useToastManager();
	const [all, setAll] = useState(false);
	const [selected, setSelected] = useState<string[]>([]);
	const [title, setTitle] = useState('');
	const [body, setBody] = useState('');
	const [url, setUrl] = useState('');

	const send = async () => {
		if (!title.trim()) {
			toast.add({ title: 'Titel is verplicht.', type: 'error' });
			return;
		}
		if (!all && selected.length === 0) {
			toast.add({ title: 'Kies minstens één ontvanger.', type: 'error' });
			return;
		}
		const ok = await onSend({ title: title.trim(), body: body.trim(), url: url.trim(), all, userIds: selected });
		if (ok) {
			setTitle('');
			setBody('');
			setUrl('');
			setSelected([]);
			setAll(false);
		}
	};

	return (
		<div className="notif-composer">
			<section className="card">
				<h3 className="title">Bericht</h3>
				<div className="inventory-form">
					<Field name="title">
						<Field.Label>Titel</Field.Label>
						<TextInput value={title} onChange={(e) => setTitle(e.currentTarget.value)} />
					</Field>
					<Field name="body">
						<Field.Label>Bericht</Field.Label>
						<TextArea value={body} onChange={(e) => setBody(e.currentTarget.value)} />
					</Field>
					<Field name="url">
						<Field.Label>Link (optioneel)</Field.Label>
						<TextInput value={url} onChange={(e) => setUrl(e.currentTarget.value)} placeholder="/dashboard/…" />
					</Field>
				</div>
			</section>
			<section className="card">
				<h3 className="title">Ontvangers</h3>
				<div className="inventory-form">
					<label className="con-packed">
						<Switch checked={all} onCheckedChange={setAll} aria-label="Alle leden" />
						Alle leden
					</label>
					{!all && (
						<Field name="recipients">
							<Field.Label>Ontvangers</Field.Label>
							<Select
								multiple
								value={selected}
								onValueChange={(v) => setSelected((v as string[]) ?? [])}
								options={members.map((m) => ({ value: m.id, label: m.username ?? m.id.slice(0, 8) }))}
							/>
						</Field>
					)}
					<Content element="p" className="field-note">
						{all ? 'Alle leden' : `${selected.length} ontvanger(s)`}. Alleen leden met een account ontvangen de melding.
					</Content>
				</div>
			</section>
			<div className="actions">
				<Button variant="primary" onClick={send} disabled={busy}>
					{busy ? 'Bezig…' : 'Versturen'}
				</Button>
			</div>
		</div>
	);
};

export default NotificationComposerForm;
