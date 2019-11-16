const STATUS = {
    PENDING: 'pending',
    RESOLVED: 'resolved',
    REJECTED: 'rejected',
};

class YJPromise {
    constructor(resolver) {
        this.status = STATUS.PENDING;

        if (!resolver) {
            return this;
        }
        if (typeof resolver !== 'function') {
            this._invoke(resolver, STATUS.RESOLVED);
            return this;
        }

        resolver(
            (v) => {
                this._invoke(v, STATUS.RESOLVED);
            },
            (e) => {
                this._invoke(e, STATUS.REJECTED);
            },
        );
    }

    _getNextEvent(now, eventName) {
        if (now[eventName]) return [now._nextPromise, now[eventName]];

        if (now._nextPromise) {
            return now._nextPromise[eventName] && [now._nextPromise, now._nextPromise[eventName]] || this._getNextEvent(now._nextPromise, eventName);
        }
    }

    _invoke(value, status) {
        let eventName = null;
        let returnValue = null;
        let event = null;
        let lastOne = null;
        let nextEvent = null;

        this.value = value;
        this.status = status;

        if (status === STATUS.RESOLVED) {
            eventName = '_onFulfillment';
        } else if (status === STATUS.REJECTED) {
            eventName = '_onRejection';
        }

        nextEvent = this._getNextEvent(this, eventName);
        if (!nextEvent) return null;

        [lastOne, event] = nextEvent;
        returnValue = event && event(value);

        if (returnValue && returnValue.constructor === YJPromise) {
            if (returnValue.status === STATUS.PENDING) {
                returnValue._nextPromise = lastOne._nextPromise;
            } else if (returnValue.status === STATUS.RESOLVED || returnValue.status === STATUS.REJECTED) {
                this._nextPromise._invoke(returnValue.value, returnValue.status);
            }
        } else if (lastOne && returnValue) {
            lastOne._invoke(returnValue, status);
        } else {
            this._nextPromise.status = STATUS.RESOLVED;
            this._nextPromise.value = returnValue;
        }

        return true;
    }

    then(onFulfillment, onRejection) {
        this._onFulfillment = onFulfillment;
        this._onRejection = onRejection;
        this._nextPromise = new YJPromise();

        const result = this._invoke(this.value, this.status);

        if (!result) {
            this._nextPromise.status = this.status;
            this._nextPromise.value = this.value;
        }

        return this._nextPromise;
    }

    catch (onRejection) {
        return this.then(this._onFulfillment, onRejection);
    }

    static resolve(value) {
        return new YJPromise(value);
    }
};

module.exports = YJPromise;