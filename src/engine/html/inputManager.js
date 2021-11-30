
export default class HtmlInputManager {

    constructor(document) {
        this.keys = {};
        
        document.addEventListener("keydown", event => this.__keyDownHandler(this, event), false);
        document.addEventListener("keyup", event => this.__keyUpHandler(this, event), false);
        document.addEventListener("keypress", event => this.__keyPressedHandler(this, event), false);
    }

    isKeyDown(key) {
        return key in this.keys && this.keys[key] == 1;
    }

    isKeyPressed(key) {
        return key in this.keys && this.keys[key] == 2;
    }

    isKeyUp() {
        return !(key in this.keys);
    }


    __keyDownHandler(inputManager, event) {
        inputManager.keys[event.key] = 1;
    }
    
    __keyPressedHandler(inputManager, event) {
        inputManager.keys[event.key] = 2;
    }
    
    __keyUpHandler(inputManager, event) {
        if (event.key in inputManager.keys)
            delete inputManager.keys[event.key];
    }
}