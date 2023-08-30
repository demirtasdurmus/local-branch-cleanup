import { Command } from 'commander';
import { AbstractCommand } from './abstract.command';

export class InfoCommand extends AbstractCommand {
    public load(program: Command): void {
        program
            .command('info')
            .alias('i')
            .description('Display cli details.')
            .action(async () => {
                await this.action.handle();
            });
    }
}
