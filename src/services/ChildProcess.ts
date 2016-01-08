'use strict';

let child_process = require('child_process');

export class ChildProcess {
    static async spawnAsync(executable: string, args: string[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
           
           let handle = child_process.spawn(executable, args);
           
           handle.on('close', (code: string) => {
               if (code == '0') {
                   resolve();
               }
               
               else {
                   reject(code);
               }
           });
            
        });
    }
}