-- Fase C — inkomsten. Enum apart (net als expense_category in fase5c): een net-aangemaakt type mag bij
-- sommige clients in dezelfde transactie nog niet als kolomtype gebruikt worden. Mirrors de aanpak van
-- public.expense_category (aparte enum-kolom als categorie), maar met inkomst-eigen waarden — donaties,
-- verkoop op de stand, sponsoring — die semantisch niet in de kosten-categorieën passen.
create type public.income_category as enum ('donation', 'sale', 'sponsorship', 'other');
