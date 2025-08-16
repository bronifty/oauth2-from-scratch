/**
 * This module configure how form authenticate (email + password) and the social
 * login will work in the Authorization Server.
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { FormParser } from "@edgefirst-dev/data/parser";
import { Octokit } from "octokit";
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { GitHubStrategy } from "remix-auth-github";
import { Subject } from "../entities/subject";
import { SubjectCredential } from "../entities/subject-credential";
import { SubjectProvider } from "../entities/subject-provider";
import env from "./env";

const authenticator = new Authenticator<Subject>();

authenticator.use(
	new FormStrategy(async ({ form }) => {
		let parser = new FormParser(form);

		let email = parser.string("email");
		let password = parser.string("password");

		let subject = Subject.findByEmail(email);

		if (!subject) {
			let subject = Subject.register(email);
			SubjectCredential.assign(subject, await Bun.password.hash(password));
			return subject;
		}

		for (let credential of subject.credentials) {
			let correctPassword = await Bun.password.verify(
				password,
				credential.passwordHash,
			);
			if (correctPassword) return credential.subject;
		}

		throw new Error("Invalid email or password");
	}),
);

authenticator.use(
	new GitHubStrategy(
		{
			clientId: env.github.clientId,
			clientSecret: env.github.clientSecret,
			redirectURI: "http://localhost:4001/provider?id=github",
			scopes: ["user:email"],
		},
		async ({ tokens }) => {
			let gh = new Octokit({ auth: tokens.accessToken() });
			let user = await gh.request("GET /user");
			let { node_id: externalId, email } = user.data;

			if (!email) throw new Error("Email not found");
			if (!externalId) throw new Error("Provider ID not found");

			// We look for the subject provider first because the user may have
			// changed their email address in the provider, but we want to
			// keep the same subject in our system
			let provider = SubjectProvider.findByProvider(externalId, "github");
			if (provider) return provider.subject;

			let subject = Subject.findByEmail(email);
			if (!subject) subject = Subject.register(email);

			SubjectProvider.assign(subject, externalId, "github");
			return subject;
		},
	),
);

export async function authenticate(
	request: Request,
	strategy: "form" | "github",
) {
	try {
		return await authenticator.authenticate(strategy, request);
	} catch (error) {
		if (error instanceof Response) return error;
		throw error;
	}
}
