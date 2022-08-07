import type InteractionContext from "../models/InteractionContext";
import type NeedleCommand from "../models/NeedleCommand";

export default class CommandExecutorService {
	public async execute(command: NeedleCommand | undefined, context: InteractionContext): Promise<void> {
		if (!context.interaction.isCommand()) return;

		try {
			return await command?.onExecuted(context);
		} catch (e) {
			// TODO: Use actual message key ERR_UNKNOWN
			// TODO: Button to support server and bug report
			context.interaction.reply({
				content: "Something went wrong with this command, please try again later.",
				ephemeral: true,
			});

			console.error(e);
		}
	}
}
