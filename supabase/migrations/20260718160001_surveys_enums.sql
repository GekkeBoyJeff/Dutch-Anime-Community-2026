-- Enquêtes & polls — enums apart (een net toegevoegde enumwaarde is niet in dezelfde tx bruikbaar).
create type public.survey_question_kind as enum
	('rating_1_5', 'scale_0_10', 'yes_no', 'number', 'date', 'text', 'single_choice', 'multi_choice');
create type public.survey_access_mode as enum ('public', 'authenticated');
create type public.survey_audience as enum ('all_users', 'role', 'event_attendees');

alter type public.app_permission add value if not exists 'surveys.manage';
