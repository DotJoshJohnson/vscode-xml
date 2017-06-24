let child_process = require("child_process");

export class ChildProcess {
    static async spawnAsync(executable: string, args: string[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
           
           let output: string = "";
           let handle = child_process.spawn(executable, args);
           
           handle.stdout.on("data", (data: string) => {
               output += data;
           });
           
           handle.stderr.on("data", (data: string) => {
               output += data;
           });
           
           handle.on("close", (code: string) => {
               if (code == "0") {
                   resolve();
               }
               
               else {
                   reject({ code: code, message: output });
               }
           });
            
        });
    }
}