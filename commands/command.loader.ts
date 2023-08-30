import * as chalk from 'chalk';
import { Command } from 'commander';
import { ExcludeCommand } from './exclude.command';
import { ExcludeAction } from '../actions';
import { ERROR_PREFIX } from '../lib/ui/prefixes';
import { InfoCommand } from './info.command';
import { InfoAction } from '../actions/info.action';

export class CommandLoader {
    public static async load(program: Command): Promise<void> {
        new InfoCommand(new InfoAction()).load(program);
        new ExcludeCommand(new ExcludeAction()).load(program);

        this.handleInvalidCommand(program);
    }

    private static handleInvalidCommand(program: Command): void {
        program.on('command:*', () => {
            console.error(`\n${ERROR_PREFIX} Invalid command: ${chalk.red('%s')}`, program.args.join(' '));
            console.log(`See ${chalk.red('--help')} to list available commands.\n`);
            process.exit(1);
        });
    }
}
