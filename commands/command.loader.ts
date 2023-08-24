import * as chalk from 'chalk';
import { Command } from 'commander';
import { ExcludeCommand } from './exclude.command';
import { ExcludeAction } from '../actions';
import { ERROR_PREFIX } from '../lib/ui/prefixes';

export class CommandLoader {
    public static async load(program: Command): Promise<void> {
        new ExcludeCommand(new ExcludeAction()).load(program);

        this.handleInvalidCommand(program);
    }

    // TODO: review this later
    private static handleInvalidCommand(program: Command): void {
        program.on('command:*', () => {
            console.error(`\n${ERROR_PREFIX} Invalid command: ${chalk.red('%s')}`, program.args.join(' '));
            console.log(`See ${chalk.red('--help')} to list available commands.\n`);
            process.exit(1);
        });
    }
}
