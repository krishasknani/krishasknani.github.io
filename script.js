// Terminal Interface
class Terminal {
    constructor() {
        this.currentDirectory = '~';
        this.commandHistory = [];
        this.historyIndex = -1;
        this.terminalContent = document.getElementById('terminal-content');
        this.currentCommandElement = this.terminalContent.querySelector('.command-input');
        this.cursorElement = this.terminalContent.querySelector('.cursor');
        
        this.commands = {
            'ls': this.listDirectory.bind(this),
            'cd': this.changeDirectory.bind(this),
            'cat': this.catFile.bind(this),
            'help': this.showHelp.bind(this),
            'clear': this.clearTerminal.bind(this),
            'welcome': this.showWelcome.bind(this),
            'whoami': this.whoami.bind(this),
            'pwd': this.printWorkingDirectory.bind(this),
            'social': this.showSocial.bind(this),
            'contact': this.showContact.bind(this)
        };
        
        this.directoryStructure = {
            '~': {
                type: 'directory',
                contents: ['projects', 'experience', 'hobbies', 'social', 'contact', 'headshot.jpg']
            },
            '~/projects': {
                type: 'directory',
                contents: ['PathVoice', 'Sideline', 'Bump', 'Rentathon']
            },
            '~/experience': {
                type: 'directory',
                contents: ['SDE Intern @ AWS', 'SDE Intern @ AWS', 'SWE Intern @ Travelers']
            },
            '~/hobbies': {
                type: 'directory',
                contents: ['photography', 'running', 'lifting weights', 'hiking']
            }
        };
        
        this.init();
    }
    
    init() {
        // Set initial cursor as active
        if (this.cursorElement) {
            this.cursorElement.classList.add('active');
        }
        
        this.terminalContent.addEventListener('click', () => {
            this.focusInput();
        });
        
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        this.focusInput();
    }
    
    focusInput() {
        this.currentCommandElement.focus();
    }
    
    handleKeyPress(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.executeCommand();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.navigateHistory('up');
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.navigateHistory('down');
        } else if (e.key === 'Tab') {
            e.preventDefault();
            this.autoComplete();
        }
    }
    
    navigateHistory(direction) {
        if (direction === 'up' && this.historyIndex < this.commandHistory.length - 1) {
            this.historyIndex++;
            this.currentCommandElement.textContent = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
        } else if (direction === 'down' && this.historyIndex > 0) {
            this.historyIndex--;
            this.currentCommandElement.textContent = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
        } else if (direction === 'down' && this.historyIndex === 0) {
            this.historyIndex = -1;
            this.currentCommandElement.textContent = '';
        }
    }
    
    autoComplete() {
        const currentInput = this.currentCommandElement.textContent.trim();
        const availableCommands = Object.keys(this.commands);
        const currentDirContents = this.getCurrentDirectoryContents();
        
        const allOptions = [...availableCommands, ...currentDirContents];
        const matches = allOptions.filter(option => 
            option.startsWith(currentInput) && option !== currentInput
        );
        
        if (matches.length === 1) {
            this.currentCommandElement.textContent = matches[0];
        } else if (matches.length > 1) {
            this.printOutput(`<div class="directory-listing">${matches.map(match => 
                `<div class="directory-item">${match}</div>`
            ).join('')}</div>`);
        }
    }
    
    executeCommand() {
        const commandLine = this.currentCommandElement.textContent.trim();
        if (!commandLine) {
            this.newPrompt();
            return;
        }
        
        this.commandHistory.push(commandLine);
        this.historyIndex = -1;
        
        const [command, ...args] = commandLine.split(' ');
        
        this.printCommand(commandLine);
        
        if (this.commands[command]) {
            this.commands[command](args);
        } else {
            this.printError(`command not found: ${command}. type 'help' for available commands.`);
        }
        
        this.currentCommandElement.textContent = '';
        this.newPrompt();
    }
    
    printCommand(command) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = `
            <span class="prompt">krish@asknani:${this.currentDirectory}$</span>
            <span class="command">${command}</span>
        `;
        this.terminalContent.appendChild(line);
        this.scrollToBottom();
    }
    
    printOutput(content) {
        const output = document.createElement('div');
        output.className = 'output';
        output.innerHTML = content;
        this.terminalContent.appendChild(output);
        this.scrollToBottom();
    }
    
    printError(message) {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = message;
        this.terminalContent.appendChild(error);
        this.scrollToBottom();
    }
    
    newPrompt() {
        // Remove active class from all previous cursors
        const allCursors = this.terminalContent.querySelectorAll('.cursor');
        allCursors.forEach(cursor => cursor.classList.remove('active'));
        
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = `
            <span class="prompt">krish@asknani:${this.currentDirectory}$</span>
            <span class="command-input" contenteditable="true" spellcheck="false"></span>
            <span class="cursor active">█</span>
        `;
        this.terminalContent.appendChild(line);
        
        this.currentCommandElement = line.querySelector('.command-input');
        this.cursorElement = line.querySelector('.cursor');
        this.focusInput();
        this.scrollToBottom();
    }
    
    scrollToBottom() {
        this.terminalContent.scrollTop = this.terminalContent.scrollHeight;
    }
    
    getCurrentDirectoryContents() {
        return this.directoryStructure[this.currentDirectory]?.contents || [];
    }
    
    // Command implementations
    listDirectory() {
        const contents = this.getCurrentDirectoryContents();
        if (contents.length === 0) {
            this.printOutput('<div class="output">directory is empty</div>');
            return;
        }
        
        const listing = contents.map(item => {
            let type = 'file';
            if (this.directoryStructure[`${this.currentDirectory}/${item}`]) {
                type = 'directory';
            } else if (item.includes('.jpg') || item.includes('.png')) {
                type = 'image';
            }
            
            return `<div class="directory-item ${type}">${item}</div>`;
        }).join('');
        
        this.printOutput(`<div class="directory-listing">${listing}</div>`);
    }
    
    changeDirectory(args) {
        if (args.length === 0) {
            this.currentDirectory = '~';
            return;
        }
        
        const target = args[0];
        
        if (target === '..' || target === '../') {
            if (this.currentDirectory !== '~') {
                const parts = this.currentDirectory.split('/');
                parts.pop();
                this.currentDirectory = parts.join('/') || '~';
            }
            return;
        }
        
        if (target === '~' || target === '/') {
            this.currentDirectory = '~';
            return;
        }
        
        const newPath = this.currentDirectory === '~' ? `~/${target}` : `${this.currentDirectory}/${target}`;
        
        if (this.directoryStructure[newPath]) {
            this.currentDirectory = newPath;
        } else {
            this.printError(`no such directory: ${target}`);
        }
    }
    
    catFile(args) {
        if (args.length === 0) {
            this.printError('usage: cat <filename>');
            return;
        }
        
        const filename = args[0];
        
        if (filename === 'headshot.jpg') {
            this.printOutput(`
                <div class="output">
                    <img src="images/headshot.jpg" alt="Krish Asknani" style="width: 100px; height: 100px; border-radius: 50%; border: 2px solid #00ff00;">
                    <p>krish asknani - final year computer science student at Georgia Tech</p>
                </div>
            `);
        } else if (filename === 'project1') {
            this.printOutput(`
                <div class="content-section">
                    <h2>project name</h2>
                    <div class="project-item">
                        <div class="project-header">
                            <h3>project name</h3>
                            <div class="project-links">
                                <a href="#" target="_blank" class="project-link">live</a>
                                <a href="#" target="_blank" class="project-link">code</a>
                            </div>
                        </div>
                        <p class="description">a brief description of your project. what technologies you used, what problems you solved, and what you learned.</p>
                    </div>
                </div>
            `);
        } else {
            this.printError(`no such file: ${filename}`);
        }
    }
    
    showHelp() {
        this.printOutput(`
            <div class="help-output">
                <div><span class="help-command">ls</span><span class="help-description">list directory contents</span></div>
                <div><span class="help-command">cd &lt;dir&gt;</span><span class="help-description">change directory</span></div>
                <div><span class="help-command">cat &lt;file&gt;</span><span class="help-description">display file contents</span></div>
                <div><span class="help-command">pwd</span><span class="help-description">print working directory</span></div>
                <div><span class="help-command">whoami</span><span class="help-description">display current user</span></div>
                <div><span class="help-command">social</span><span class="help-description">show social media links</span></div>
                <div><span class="help-command">contact</span><span class="help-description">show contact information</span></div>
                <div><span class="help-command">clear</span><span class="help-description">clear terminal</span></div>
                <div><span class="help-command">welcome</span><span class="help-description">show welcome message</span></div>
            </div>
        `);
    }
    
    clearTerminal() {
        this.terminalContent.innerHTML = '';
        this.newPrompt();
    }
    
    showWelcome() {
        this.printOutput(`
            <div class="welcome-message">
                <div class="profile-section">
                    <img src="images/headshot.jpg" alt="Krish Asknani" id="profile-pic">
                    <h1>krish asknani</h1>
                    <p>final year computer science student at Georgia Tech</p>
                </div>
                <p>type 'help' for available commands</p>
            </div>
        `);
    }
    
    whoami() {
        this.printOutput('<div class="output">krish asknani</div>');
    }
    
    printWorkingDirectory() {
        this.printOutput(`<div class="output">${this.currentDirectory}</div>`);
    }
    
    showSocial() {
        this.printOutput(`
            <div class="social-links">
                <a href="https://www.linkedin.com/in/krish-asknani/" target="_blank" class="social-link">linkedin</a>
                <a href="https://github.com/krishasknani" target="_blank" class="social-link">github</a>
                <a href="mailto:krish.asknani@gatech.edu" class="social-link">email</a>
                <a href="https://www.instagram.com/krish.asknani/" target="_blank" class="social-link">instagram</a>
            </div>
        `);
    }
    
    showContact() {
        this.printOutput(`
            <div class="output">
                <p><strong>email:</strong> krish.asknani@gatech.edu</p>
                <p><strong>location:</strong> Atlanta, GA</p>
                <p><strong>available for:</strong> freelance work, collaborations, coffee chats</p>
            </div>
        `);
    }
}

// Initialize terminal when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Terminal();
});

// Console message
console.log('%ckrish@asknani:~$', 'font-family: monospace; font-size: 16px; color: #00ff00;');
console.log('%ctype "help" for available commands', 'font-family: monospace; font-size: 14px; color: #ccc;');
