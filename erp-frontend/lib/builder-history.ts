/* ── Undo / Redo state manager for the page builder ── */

export interface BuilderBlock {
    id: string;
    type: string;
    data: Record<string, any>;
}

export type PageState = BuilderBlock[];

const MAX_HISTORY = 50;

export class BuilderHistory {
    private stack: PageState[] = [];
    private pointer = -1;

    constructor(initial: PageState) {
        this.push(initial);
    }

    /** Snapshot current state */
    push(state: PageState) {
        // Trim any future states when pushing after an undo
        this.stack = this.stack.slice(0, this.pointer + 1);
        this.stack.push(JSON.parse(JSON.stringify(state)));
        if (this.stack.length > MAX_HISTORY) this.stack.shift();
        else this.pointer++;
    }

    undo(): PageState | null {
        if (!this.canUndo) return null;
        this.pointer--;
        return JSON.parse(JSON.stringify(this.stack[this.pointer]));
    }

    redo(): PageState | null {
        if (!this.canRedo) return null;
        this.pointer++;
        return JSON.parse(JSON.stringify(this.stack[this.pointer]));
    }

    get canUndo() { return this.pointer > 0; }
    get canRedo() { return this.pointer < this.stack.length - 1; }
    get current(): PageState { return JSON.parse(JSON.stringify(this.stack[this.pointer])); }
}
