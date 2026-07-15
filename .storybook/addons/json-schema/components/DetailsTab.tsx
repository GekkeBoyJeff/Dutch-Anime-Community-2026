import React from 'react';
import { styled } from 'storybook/theming';

import { describeType, listProperties, type JsonSchemaNode, type SchemaPath } from '../lib/walk';

const List = styled.div({ padding: '12px 16px', overflow: 'auto' });

const Heading = styled.div(({ theme }) => ({
	color: theme.color.mediumdark,
	fontSize: theme.typography.size.s1,
	fontWeight: theme.typography.weight.bold,
	letterSpacing: '0.05em',
	textTransform: 'uppercase',
	marginBottom: 12,
}));

const Row = styled.div({ marginBottom: 16 });

const Name = styled.span(({ theme }) => ({
	fontWeight: theme.typography.weight.bold,
	fontSize: theme.typography.size.s2,
	color: theme.color.defaultText,
}));

const Required = styled.span(({ theme }) => ({
	marginLeft: 8,
	padding: '1px 5px',
	borderRadius: 3,
	background: theme.color.negative,
	color: theme.color.lightest,
	fontSize: theme.typography.size.s1,
	fontWeight: theme.typography.weight.bold,
	textTransform: 'uppercase',
}));

const TypeLink = styled.button(({ theme }) => ({
	display: 'block',
	background: 'none',
	border: 0,
	padding: 0,
	marginTop: 2,
	cursor: 'pointer',
	color: theme.color.secondary,
	textDecoration: 'underline',
	fontSize: theme.typography.size.s2,
}));

const TypeText = styled.div(({ theme }) => ({
	marginTop: 2,
	color: theme.color.mediumdark,
	fontSize: theme.typography.size.s2,
	fontFamily: theme.typography.fonts.mono,
}));

const Description = styled.div(({ theme }) => ({
	marginTop: 2,
	color: theme.color.mediumdark,
	fontSize: theme.typography.size.s2,
}));

const DetailsTab = ({
	node,
	path,
	onNavigate,
}: {
	node: JsonSchemaNode;
	path: SchemaPath;
	onNavigate: (p: SchemaPath) => void;
}) => {
	const properties = listProperties(node);
	if (properties.length === 0) {
		const type = describeType(node);
		return (
			<List>
				{type.variants ? (
					type.variants.map((variant) => {
						const handleVariant = () => onNavigate([...path, variant.index]);
						return (
							<TypeLink key={variant.index} onClick={handleVariant}>
								{variant.label}
							</TypeLink>
						);
					})
				) : (
					<TypeText>{type.label}</TypeText>
				)}
				{typeof node.description === 'string' && <Description>{node.description}</Description>}
			</List>
		);
	}
	return (
		<List>
			<Heading>Properties</Heading>
			{properties.map(({ name, node: child, required }) => {
				const type = describeType(child);
				const handleNavigate = () => onNavigate([...path, name]);
				return (
					<Row key={name}>
						<Name>{name}</Name>
						{required && <Required>required</Required>}
						{type.navigable ? (
							<TypeLink onClick={handleNavigate}>{type.label}</TypeLink>
						) : type.variants ? (
							type.variants.map((variant) => {
								const handleVariant = () => onNavigate([...path, name, variant.index]);
								return (
									<TypeLink key={variant.index} onClick={handleVariant}>
										{variant.label}
									</TypeLink>
								);
							})
						) : (
							<TypeText>{type.label}</TypeText>
						)}
						{typeof child.description === 'string' && <Description>{child.description}</Description>}
					</Row>
				);
			})}
		</List>
	);
}

export default DetailsTab;
