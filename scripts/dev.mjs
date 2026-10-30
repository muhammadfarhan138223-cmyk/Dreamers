import {spawn} from 'node:child_process';
const args=process.argv.slice(2);const port=args.indexOf('--port');
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--webpack','--hostname','0.0.0.0',...(port>=0?['--port',args[port+1]]:[])],{stdio:'inherit',env:process.env});
process.on('SIGTERM',()=>child.kill('SIGTERM'));process.on('SIGINT',()=>child.kill('SIGINT'));child.on('exit',code=>process.exit(code||0));
