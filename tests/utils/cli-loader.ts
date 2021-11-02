import { existsSync } from 'fs';
import * as path from 'path';
import { cliArguments, reloadFromConfigFile } from 'cli-argument-parser';

/**
 * Loading the CLI arguments via config file if exists for the tests
 */
export function loadArguments(): void {
    const envFile = `${process.cwd()}${path.sep}.env`;
    const isExists = existsSync(envFile)
    if(isExists) {
        reloadFromConfigFile(envFile);
    }
    //Setting the default browser as chrome:headless in case not specified.
    if(!cliArguments.browser) {
        cliArguments.browser = 'chrome:headless'
    }
}