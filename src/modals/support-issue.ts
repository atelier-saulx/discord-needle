import {
	GuildMember,
	type GuildTextBasedChannel,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { makeRow } from "../helpers/djsHelpers.js";
import type InteractionContext from "../models/InteractionContext.js";
import MessageVariables from "../models/MessageVariables.js";
import NeedleModal from "../models/NeedleModal.js";

export default class SupportIssueModal extends NeedleModal {
	public readonly customId = "support-issue";
	public get builder(): ModalBuilder {
		const priorityInput = new TextInputBuilder()
			.setCustomId("priority")
			.setLabel("Priority (P1, P2, P3, P4)")
			.setRequired(true)
			.setPlaceholder("P3")
			.setStyle(TextInputStyle.Short)
			.setMaxLength(2);

		const descriptionInput = new TextInputBuilder()
			.setCustomId("description")
			.setLabel("Issue Description")
			.setRequired(true)
			.setPlaceholder("Brief description of the problem")
			.setStyle(TextInputStyle.Paragraph)
			.setMaxLength(1000);

		const stepsInput = new TextInputBuilder()
			.setCustomId("steps")
			.setLabel("Steps to Reproduce")
			.setRequired(true)
			.setPlaceholder("1. First step\n2. Second step\n3. Third step")
			.setStyle(TextInputStyle.Paragraph)
			.setMaxLength(1000);

		const expectedInput = new TextInputBuilder()
			.setCustomId("expected")
			.setLabel("Expected vs Actual Behavior")
			.setRequired(true)
			.setPlaceholder("Should: What should happen\nActually: What is happening")
			.setStyle(TextInputStyle.Paragraph)
			.setMaxLength(1000);

		const environmentInput = new TextInputBuilder()
			.setCustomId("environment")
			.setLabel("Environment (Web/Desktop/Mobile)")
			.setRequired(true)
			.setPlaceholder("Web")
			.setStyle(TextInputStyle.Short)
			.setMaxLength(20);

		return new ModalBuilder()
			.setCustomId(this.customId)
			.setTitle("Support Issue Report")
			.addComponents(
				makeRow(priorityInput),
				makeRow(descriptionInput),
				makeRow(stepsInput),
				makeRow(expectedInput),
				makeRow(environmentInput),
			);
	}

	public async submit(context: InteractionContext): Promise<void> {
		if (!context.isModalSubmit()) return;

		const { interaction } = context;
		const priority = interaction.fields.getTextInputValue("priority");
		const description = interaction.fields.getTextInputValue("description");
		const steps = interaction.fields.getTextInputValue("steps");
		const expected = interaction.fields.getTextInputValue("expected");
		const environment = interaction.fields.getTextInputValue("environment");

		const supportReport = [
			"# Issue Report",
			`## Priority: ${priority}`,
			"",
			"### Issue Description",
			description,
			"",
			"### Steps to Reproduce",
			steps,
			"",
			"### Expected vs Actual",
			expected,
			"",
			"### Environment",
			`Where: ${environment}`,
			"",
			`Reported by: ${interaction.user.toString()}`,
		].join("\n");

		// First acknowledge the modal submission
		await interaction.deferReply({ ephemeral: true });

		if (interaction.channel && "guild" in interaction.channel) {
			const guildChannel = interaction.channel as GuildTextBasedChannel;
			console.log("Sending support report message...");
			const sentMessage = await interaction.channel.send({
				content: supportReport,
			});
			console.log("Support report message sent:", sentMessage.id);

			// Force thread creation directly
			const threadCreator = this.bot.getThreadCreationService();
			if (threadCreator) {
				console.log("Attempting to create thread...");
				const messageVariables = new MessageVariables()
					.setChannel(guildChannel)
					.setUser(
						interaction.member instanceof GuildMember
							? interaction.member
							: interaction.user,
					);

				await threadCreator.createOrUpdateThreadOnMessage(
					sentMessage,
					messageVariables,
				);
			}
		}

		await interaction.editReply({
			content: "Support issue has been submitted!",
		});
	}
}
