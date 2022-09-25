export type NoteType = 'tap' | 'hold' | 'drag' | 'slide'

export class BaseNote<T extends NoteType> {
    type: T

    constructor(type: T) {
        this.type = type;
    }

    /**
     * 判定该note为完美
     */
    perfect(): BaseNote<T> {
        return this;
    }

    /**
     * 判定该note为好
     */
    good(): BaseNote<T> {
        return this;
    }

    /**
     * 判定该note为miss
     */
    miss(): BaseNote<T> {
        return this;
    }
}

export class TapNote extends BaseNote<'tap'> {

    constructor() {
        super('tap');
    }
}

export class HoldNote extends BaseNote<'hold'> {

    constructor() {
        super('hold');
    }
}

export class DragNote extends BaseNote<'drag'> {

    constructor() {
        super('drag');
    }
}

export class SlideNote extends BaseNote<'slide'> {

    constructor() {
        super('slide');
    }
}