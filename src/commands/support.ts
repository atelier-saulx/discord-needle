import { PermissionFlagsBits } from "discord.js";
import type InteractionContext from "../models/InteractionContext.js";
import NeedleCommand from "../models/NeedleCommand.js";
import CommandCategory from "../models/enums/CommandCategory.js";

export default class SupportCommand extends NeedleCommand {
	public readonly name = "support";
	public readonly description = "Submit a support issue";
	public readonly category = CommandCategory.Configuration;
	protected readonly defaultPermissions = PermissionFlagsBits.SendMessages;

	public async execute(context: InteractionContext): Promise<void> {
		if (!context.isSlashCommand() || !context.isInGuild()) return;
		const supportModal = this.bot.getModal("support-issue");
		await context.interaction.showModal(supportModal.builder);
	}
}
