import { Command } from 'commander';
import { AbstractCommand } from './abstract.command';
import { ICommandInput } from './command-input.interface';
import { ERROR_PREFIX } from '../lib/ui/prefixes';
import * as chalk from 'chalk';

export class ExcludeCommand extends AbstractCommand {
    public load(program: Command): void {
        program
            .command('exclude')
            .alias('e')
            .description('Delete all local branches except the one specified')
            .argument('[branchToKeep]', 'Branch to keep', 'main')
            .action(async (branchToKeep: string) => {
                const inputs: ICommandInput[] = [];
                inputs.push({ name: 'branchToKeep', value: branchToKeep });
                const options: ICommandInput[] = [];
                const extraFlags: string[] = [];
                try {
                    await this.action.handle(inputs, options, extraFlags);
                } catch (err) {
                    console.error(`\n${ERROR_PREFIX} ${chalk.red(err.message)}`);
                    process.exit(1);
                }
            });
    }
}
