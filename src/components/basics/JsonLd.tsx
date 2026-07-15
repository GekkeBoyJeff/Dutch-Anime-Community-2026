interface JsonLdProps {
	/** The schema.org object to serialize (see lib/seo for the builders) */
	data: unknown;
}

// Serializes JSON-LD safely for a <script>. Escapes every `<` to its unicode escape so no value
// can break out of the tag with </script>.
export const jsonLdString = (data: unknown): string => {
	return JSON.stringify(data).replace(/</g, '\\u003c');
};

// The only place in the codebase using dangerouslySetInnerHTML: renders a schema.org object as a
// non-executing <script type="application/ld+json">. jsonLdString escapes `<`, so no value can
// break out of the tag. Never pass untrusted HTML here.
const JsonLd = ({ data }: JsonLdProps) => {
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: jsonLdString(data) }}
		/>
	);
};

export default JsonLd;
