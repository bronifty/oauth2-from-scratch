/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
export default [
	{
		id: "56f0fee7-a73e-41f5-9a75-310e5bb340ee",
		name: "Address Book",
		secret: "d4023cc0-4d9f-4df2-9ed7-e4762438f9a9",
		callbacks: ["http://localhost:3000/auth"],
		isFirstParty: true,
		allowedScopes: ["openid", "contacts:read:own", "contacts:write:own"],
		allowedAudiences: ["api.addressbook.com"],
	},
] as const;
