import type { JsonLdProps as JsonLdSchemaProps } from '@/lib/site/content/schema/basics/jsonLd';

type JsonLdProps = JsonLdSchemaProps;

// Escapes every `<` to its unicode escape so no value can break out of the tag with </script>.
export const jsonLdString = (data: unknown): string => {
	return JSON.stringify(data).replace(/</g, '\\u003c');
};

const JsonLd = ({ data }: JsonLdProps) => {
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: jsonLdString(data) }}
		/>
	);
};

export default JsonLd;
