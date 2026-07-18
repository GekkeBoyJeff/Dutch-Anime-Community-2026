'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useState } from 'react';

import Button from '@/components/basics/Button';
import Drawer from '@/components/components/Drawer';
import Checkbox from '@/components/forms/Checkbox';
import Field from '@/components/forms/Field';
import Select from '@/components/forms/Select';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { APP_ROLES, type AppRole } from '@/lib/auth/permissions';
import { getBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type SurveyInsert = Database['public']['Tables']['surveys']['Insert'];

type Kind = 'rating_1_5' | 'scale_0_10' | 'yes_no' | 'number' | 'date' | 'text' | 'single_choice' | 'multi_choice';

export interface EventOption {
	id: string;
	name: string;
}
export interface SurveyListItem {
	id: string;
	title: string;
}

interface OptionForm {
	label: string;
}
interface QuestionForm {
	label: string;
	kind: Kind;
	required: boolean;
	options: OptionForm[];
}
interface Form {
	title: string;
	description: string;
	access_mode: 'public' | 'authenticated';
	anonymous: boolean;
	audience: 'all_users' | 'role' | 'event_attendees';
	audience_role: AppRole | '';
	event_id: string;
	questions: QuestionForm[];
}

const EMPTY: Form = {
	title: '',
	description: '',
	access_mode: 'authenticated',
	anonymous: false,
	audience: 'all_users',
	audience_role: '',
	event_id: '',
	questions: [],
};

const KIND_OPTIONS = [
	{ value: 'rating_1_5', label: 'Score 1–5' },
	{ value: 'scale_0_10', label: 'Schaal 0–10 (NPS)' },
	{ value: 'yes_no', label: 'Ja / nee' },
	{ value: 'number', label: 'Getal' },
	{ value: 'date', label: 'Datum' },
	{ value: 'text', label: 'Vrije tekst' },
	{ value: 'single_choice', label: 'Keuze (één antwoord)' },
	{ value: 'multi_choice', label: 'Meerkeuze (meerdere)' },
];
const KIND_LABEL: Record<Kind, string> = Object.fromEntries(KIND_OPTIONS.map((o) => [o.value, o.label])) as Record<Kind, string>;
const ROLE_LABEL: Record<AppRole, string> = { user: 'Lid', author: 'Auteur', yakuza: 'Yakuza', 'stand-staff': 'Stand-staff', admin: 'Admin' };
const isChoice = (k: Kind): boolean => k === 'single_choice' || k === 'multi_choice';

interface Props {
	surveyId: string | null;
	open: boolean;
	events: EventOption[];
	otherSurveys: SurveyListItem[];
	userId: string;
	onClose: () => void;
	onSaved: () => void;
}

// Editor voor één enquête (meta + vragen + opties). Vragen worden bij opslaan volledig vervangen
// (delete + reinsert) — dat kan alleen zolang er nog GEEN inzendingen zijn; met inzendingen staan de
// vragen op slot (read-only) zodat de cascade geen historische antwoorden wist.
const SurveyEditor = ({ surveyId, open, events, otherSurveys, userId, onClose, onSaved }: Props) => {
	const toast = Toast.useToastManager();
	const [form, setForm] = useState<Form | null>(null);
	const [locked, setLocked] = useState(false);
	const [saving, setSaving] = useState(false);
	const [loadedFor, setLoadedFor] = useState<string | null>(null);

	// Reset bij openen/wisselen van doel — tijdens render, niet in een effect (setState-in-effect = eslint-error).
	const target = open ? surveyId ?? 'new' : null;
	if (target !== loadedFor) {
		setLoadedFor(target);
		setForm(target === 'new' ? { ...EMPTY, questions: [] } : null);
		setLocked(false);
	}

	useEffect(() => {
		if (!open || !surveyId) return;
		let active = true;
		const db = getBrowserClient();
		Promise.all([
			db.from('surveys').select('*').eq('id', surveyId).single(),
			db.from('survey_questions').select('*').eq('survey_id', surveyId).order('position'),
			db.from('survey_question_options').select('*').order('position'),
			db.rpc('survey_response_counts'),
		]).then(([s, q, o, c]) => {
			if (!active) return;
			if (s.error || !s.data) {
				toast.add({ title: 'Kon enquête niet laden', description: s.error?.message, type: 'error' });
				return;
			}
			const opts = (o.data ?? []) as { id: string; question_id: string; label: string }[];
			const questions: QuestionForm[] = ((q.data ?? []) as { id: string; label: string; kind: Kind; required: boolean }[]).map((qq) => ({
				label: qq.label,
				kind: qq.kind,
				required: qq.required,
				options: opts.filter((op) => op.question_id === qq.id).map((op) => ({ label: op.label })),
			}));
			const count = ((c.data ?? []) as { survey_id: string; response_count: number }[]).find((r) => r.survey_id === surveyId)?.response_count ?? 0;
			setLocked(count > 0);
			setForm({
				title: s.data.title,
				description: s.data.description ?? '',
				access_mode: s.data.access_mode,
				anonymous: s.data.anonymous,
				audience: s.data.audience,
				audience_role: (s.data.audience_role ?? '') as AppRole | '',
				event_id: s.data.event_id ?? '',
				questions,
			});
		});
		return () => {
			active = false;
		};
		// toast is niet stabiel (base-ui) — bewust buiten de deps, net als de andere schermen.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, surveyId]);

	const patchQuestion = (i: number, patch: Partial<QuestionForm>) =>
		setForm((f) => (f ? { ...f, questions: f.questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)) } : f));
	const moveQuestion = (i: number, dir: -1 | 1) =>
		setForm((f) => {
			if (!f) return f;
			const j = i + dir;
			if (j < 0 || j >= f.questions.length) return f;
			const qs = [...f.questions];
			const a = qs[i];
			const b = qs[j];
			if (!a || !b) return f;
			qs[i] = b;
			qs[j] = a;
			return { ...f, questions: qs };
		});
	const patchOption = (qi: number, oi: number, label: string) =>
		setForm((f) => (f ? { ...f, questions: f.questions.map((q, idx) => (idx === qi ? { ...q, options: q.options.map((o, k) => (k === oi ? { label } : o)) } : q)) } : f));
	const removeQuestion = (i: number) => setForm((f) => (f ? { ...f, questions: f.questions.filter((_, idx) => idx !== i) } : f));

	const copyQuestions = async (fromId: string) => {
		if (!fromId || !form) return;
		const db = getBrowserClient();
		const { data: qs } = await db.from('survey_questions').select('*').eq('survey_id', fromId).order('position');
		const qIds = ((qs ?? []) as { id: string }[]).map((q) => q.id);
		const { data: os } = qIds.length ? await db.from('survey_question_options').select('*').in('question_id', qIds).order('position') : { data: [] };
		const opts = (os ?? []) as { question_id: string; label: string }[];
		const questions: QuestionForm[] = ((qs ?? []) as { id: string; label: string; kind: Kind; required: boolean }[]).map((q) => ({
			label: q.label,
			kind: q.kind,
			required: q.required,
			options: opts.filter((o) => o.question_id === q.id).map((o) => ({ label: o.label })),
		}));
		setForm({ ...form, questions });
		toast.add({ title: `${questions.length} vragen gekopieerd`, type: 'success' });
	};

	const save = async () => {
		if (!form || saving) return;
		const title = form.title.trim();
		if (!title) return void toast.add({ title: 'Titel is verplicht.', type: 'error' });
		if (form.audience === 'role' && !form.audience_role) return void toast.add({ title: 'Kies een rol voor de doelgroep.', type: 'error' });
		if (form.audience === 'event_attendees' && !form.event_id) return void toast.add({ title: 'Kies een gekoppeld event voor deze doelgroep.', type: 'error' });
		if (!locked) {
			for (const q of form.questions) {
				if (!q.label.trim()) return void toast.add({ title: 'Elke vraag heeft een tekst nodig.', type: 'error' });
				if (isChoice(q.kind) && q.options.filter((o) => o.label.trim()).length < 1)
					return void toast.add({ title: `Keuzevraag "${q.label || '—'}" heeft minstens één optie nodig.`, type: 'error' });
			}
		}

		setSaving(true);
		const db = getBrowserClient();
		const payload: SurveyInsert = {
			title,
			description: form.description.trim() || null,
			access_mode: form.access_mode,
			anonymous: form.access_mode === 'public' ? false : form.anonymous,
			audience: form.audience,
			audience_role: form.audience === 'role' && form.audience_role ? (form.audience_role as AppRole) : null,
			event_id: form.event_id || null,
		};
		if (surveyId) payload.id = surveyId;
		else payload.created_by = userId;
		const { data: saved, error } = await db.from('surveys').upsert(payload).select('id').single();
		if (error || !saved) {
			setSaving(false);
			return void toast.add({ title: 'Opslaan mislukt', description: error?.message, type: 'error' });
		}

		if (!locked) {
			const { error: delErr } = await db.from('survey_questions').delete().eq('survey_id', saved.id);
			if (delErr) {
				setSaving(false);
				return void toast.add({ title: 'Opslaan mislukt', description: delErr.message, type: 'error' });
			}
			for (const [i, q] of form.questions.entries()) {
				const { data: qRow, error: qErr } = await db
					.from('survey_questions')
					.insert({ survey_id: saved.id, position: i, label: q.label.trim(), kind: q.kind, required: q.required })
					.select('id')
					.single();
				if (qErr || !qRow) {
					setSaving(false);
					return void toast.add({ title: 'Vraag opslaan mislukt', description: qErr?.message, type: 'error' });
				}
				if (isChoice(q.kind)) {
					const rows = q.options
						.map((o) => o.label.trim())
						.filter(Boolean)
						.map((label, j) => ({ question_id: qRow.id, position: j, label }));
					if (rows.length) {
						const { error: oErr } = await db.from('survey_question_options').insert(rows);
						if (oErr) {
							setSaving(false);
							return void toast.add({ title: 'Opties opslaan mislukt', description: oErr.message, type: 'error' });
						}
					}
				}
			}
		}

		setSaving(false);
		onSaved();
		onClose();
		toast.add({ title: surveyId ? 'Enquête opgeslagen' : 'Enquête aangemaakt', type: 'success' });
	};

	return (
		<Drawer
			open={open}
			onOpenChange={(o) => !o && onClose()}
			title={surveyId ? 'Enquête bewerken' : 'Nieuwe enquête'}
			size="42rem"
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Annuleren
					</Button>
					<Button variant="primary" onClick={save} disabled={saving || !form}>
						Opslaan
					</Button>
				</>
			}
		>
			{form && (
				<div className="survey-form">
					<Field name="title">
						<Field.Label>Titel</Field.Label>
						<TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.currentTarget.value })} />
					</Field>
					<Field name="description">
						<Field.Label>Beschrijving</Field.Label>
						<TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.currentTarget.value })} />
					</Field>

					<Field name="access">
						<Field.Label>Toegang</Field.Label>
						<Select
							native
							aria-label="Toegang"
							value={form.access_mode}
							options={[
								{ value: 'authenticated', label: 'Ingelogd (Discord)' },
								{ value: 'public', label: 'Publiek (link, anoniem)' },
							]}
							onValueChange={(v) => setForm({ ...form, access_mode: v as Form['access_mode'], anonymous: v === 'public' ? false : form.anonymous })}
						/>
					</Field>
					{form.access_mode === 'public' ? (
						<p className="survey-note">Publieke enquêtes zijn altijd anoniem — iedereen met de link kan invullen.</p>
					) : (
						<Checkbox checked={form.anonymous} onCheckedChange={(anonymous) => setForm({ ...form, anonymous })} label="Anoniem (namen niet zichtbaar in resultaten)" />
					)}

					<Field name="audience">
						<Field.Label>Doelgroep</Field.Label>
						<Select
							native
							aria-label="Doelgroep"
							value={form.audience}
							options={[
								{ value: 'all_users', label: 'Iedereen met account' },
								{ value: 'role', label: 'Specifieke rol' },
								{ value: 'event_attendees', label: 'Aanwezigen van een event' },
							]}
							onValueChange={(v) => setForm({ ...form, audience: v as Form['audience'] })}
						/>
					</Field>
					{form.audience === 'role' && (
						<Field name="role">
							<Field.Label>Rol</Field.Label>
							<Select
								native
								aria-label="Rol"
								placeholder="Kies een rol…"
								value={form.audience_role}
								options={APP_ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))}
								onValueChange={(v) => setForm({ ...form, audience_role: v as AppRole })}
							/>
						</Field>
					)}
					<Field name="event">
						<Field.Label>{form.audience === 'event_attendees' ? 'Gekoppeld event' : 'Gekoppeld event (optioneel)'}</Field.Label>
						<Select
							native
							aria-label="Gekoppeld event"
							value={form.event_id}
							options={[{ value: '', label: 'Geen' }, ...events.map((e) => ({ value: e.id, label: e.name }))]}
							onValueChange={(v) => setForm({ ...form, event_id: (v as string) ?? '' })}
						/>
					</Field>

					<div className="survey-questions-head">
						<span className="survey-questions-title">Vragen</span>
						{!locked && otherSurveys.length > 0 && (
							<Select
								native
								aria-label="Kopieer vragen van een andere enquête"
								placeholder="Kopieer vragen van…"
								value=""
								options={otherSurveys.map((s) => ({ value: s.id, label: s.title }))}
								onValueChange={(v) => copyQuestions(v as string)}
							/>
						)}
					</div>
					{locked && <p className="survey-note">Deze enquête heeft al inzendingen — de vragen staan op slot zodat antwoorden niet gewist worden.</p>}

					{locked ? (
						<ol className="survey-questions-readonly">
							{form.questions.map((q, i) => (
								<li key={i}>
									<strong>{q.label}</strong> <span className="survey-q-meta">· {KIND_LABEL[q.kind]}{q.required ? ' · verplicht' : ''}</span>
									{isChoice(q.kind) && <span className="survey-q-meta"> · {q.options.map((o) => o.label).join(', ')}</span>}
								</li>
							))}
						</ol>
					) : (
						<div className="survey-questions">
							{form.questions.map((q, i) => (
								<div className="survey-question-card" key={i}>
									<div className="survey-question-top">
										<span className="survey-question-index">Vraag {i + 1}</span>
										<span className="survey-question-tools">
											<Button variant="ghost" onClick={() => moveQuestion(i, -1)}>
												↑
											</Button>
											<Button variant="ghost" onClick={() => moveQuestion(i, 1)}>
												↓
											</Button>
											<Button variant="ghost" onClick={() => removeQuestion(i)}>
												Verwijder
											</Button>
										</span>
									</div>
									<Field name={`q${i}-label`}>
										<Field.Label>Vraag</Field.Label>
										<TextInput value={q.label} onChange={(e) => patchQuestion(i, { label: e.currentTarget.value })} />
									</Field>
									<Field name={`q${i}-kind`}>
										<Field.Label>Type</Field.Label>
										<Select
											native
											aria-label="Vraagtype"
											value={q.kind}
											options={KIND_OPTIONS}
											onValueChange={(v) => patchQuestion(i, { kind: v as Kind, options: isChoice(v as Kind) ? (q.options.length ? q.options : [{ label: '' }]) : [] })}
										/>
									</Field>
									<Checkbox checked={q.required} onCheckedChange={(required) => patchQuestion(i, { required })} label="Verplicht" />
									{isChoice(q.kind) && (
										<div className="survey-options">
											<span className="survey-options-label">Antwoordopties</span>
											{q.options.map((o, oi) => (
												<div className="survey-option-row" key={oi}>
													<TextInput aria-label={`Optie ${oi + 1}`} value={o.label} onChange={(e) => patchOption(i, oi, e.currentTarget.value)} />
													<Button variant="ghost" onClick={() => patchQuestion(i, { options: q.options.filter((_, k) => k !== oi) })}>
														Verwijder
													</Button>
												</div>
											))}
											<Button variant="secondary" icon="plus" onClick={() => patchQuestion(i, { options: [...q.options, { label: '' }] })}>
												Optie
											</Button>
										</div>
									)}
								</div>
							))}
							<Button variant="secondary" icon="plus" onClick={() => setForm({ ...form, questions: [...form.questions, { label: '', kind: 'rating_1_5', required: false, options: [] }] })}>
								Vraag toevoegen
							</Button>
						</div>
					)}
				</div>
			)}
		</Drawer>
	);
};

export default SurveyEditor;
