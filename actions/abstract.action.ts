import { ICommandInput } from '../commands';

export abstract class AbstractAction {
    public abstract handle(inputs?: ICommandInput[], options?: ICommandInput[], extraFlags?: string[]): Promise<void>;
}
