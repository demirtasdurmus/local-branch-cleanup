import { platform, release } from 'os';
import * as chalk from 'chalk';
import { AbstractAction } from '.';
import { BANNER } from '../lib/ui/banner';
import { execSync } from 'child_process';

export class InfoAction extends AbstractAction {
    public async handle() {
        this.displayPackageBanner();
        this.displaySystemInfo();
        this.displayPackageInfo();
    }

    private displayPackageBanner() {
        console.info(chalk.red(BANNER));
    }

    private async displaySystemInfo(): Promise<void> {
        console.info(chalk.green('[System Information]'));
        console.info('OS Version     :', chalk.blue(JSON.stringify(`${platform()} - ${release()}`)));
        console.info('NodeJS Version :', chalk.blue(process.version));
        console.info('NPM Version    :', chalk.blue(this.getPackageManagerInfo()), '\n');
    }

    // TODO: add support for other package managers
    // Support for npm only for now
    private getPackageManagerInfo(): string {
        try {
            const npmVersion = execSync('npm -v').toString().trim();
            return 'v' + npmVersion;
        } catch (error) {
            throw error;
        }
    }

    private displayPackageInfo(): void {
        console.info(chalk.green('[Package Information]'));
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        console.info('Package Version:', chalk.blue('v' + require('../package.json').version));
    }
}
