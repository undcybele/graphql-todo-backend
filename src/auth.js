import { mapSchema, MapperKind, getDirective } from "@graphql-tools/utils";
import { defaultFieldResolver } from "graphql";

export function authDirective(directiveName) {
	const typeDirectiveArgumentMaps = {};
	return {
		authDirectiveTypeDefs: `directive @${directiveName}(
            requires: Role = ADMIN,
            ) on OBJECT | FIELD_DEFINITION

            enum Role {
            ADMIN
            USER
            }`,
		authDirectiveTransformer: (schema) =>
			mapSchema(schema, {
				[MapperKind.TYPE]: (type) => {
					const authDirective = getDirective(schema, type, directiveName)?.[0];
					if (authDirective) {
						typeDirectiveArgumentMaps[type.name] = authDirective;
					}
					return undefined;
				},
				[MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
					const authDirective =
						getDirective(schema, fieldConfig, directiveName)?.[0] ??
						typeDirectiveArgumentMaps[typeName];
					if (!authDirective) {
						return fieldConfig;
					}
					const { requires } = authDirective;
					if (!requires) {
						return fieldConfig;
					}
					const { resolve = defaultFieldResolver } = fieldConfig;
					fieldConfig.resolve = function (source, args, context, info) {
						const user = context.loggedUser;
						if (!user.roles.some((role) => role === requires)) {
							throw new Error("not authorized");
						}
						return resolve(source, args, context, info);
					};
					return fieldConfig;
				},
			}),
	};
}

export const { authDirectiveTypeDefs, authDirectiveTransformer } =
	authDirective("auth");
