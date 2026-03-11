"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLidMappingStore = exports.globalLidMapping = void 0;

const lidToPnMap = new Map();
const pnToLidMap = new Map();

const normalizeJid = (jid) => {
    if (!jid) return null;
    return jid.split(':')[0].split('@')[0];
};

exports.globalLidMapping = {
    set(lid, pn) {
        if (!lid || !pn) return;
        const lidNorm = normalizeJid(lid);
        const pnNorm = normalizeJid(pn);
        if (lidNorm && pnNorm && /^\d+$/.test(pnNorm)) {
            lidToPnMap.set(lidNorm, pnNorm + '@s.whatsapp.net');
            pnToLidMap.set(pnNorm, lidNorm + '@lid');
        }
    },
    getPnFromLid(lid) {
        if (!lid) return undefined;
        const lidNorm = normalizeJid(lid);
        return lidToPnMap.get(lidNorm);
    },
    getLidFromPn(pn) {
        if (!pn) return undefined;
        const pnNorm = normalizeJid(pn);
        return pnToLidMap.get(pnNorm);
    },
    getAll() {
        const result = {};
        lidToPnMap.forEach((pn, lid) => {
            result[lid] = pn;
        });
        return result;
    },
    clear() {
        lidToPnMap.clear();
        pnToLidMap.clear();
    },
    size() {
        return lidToPnMap.size;
    }
};

const createLidMappingStore = () => {
    const store = new Map();
    const reverseStore = new Map();
    
    const normalizeJid = (jid) => {
        if (!jid) return null;
        return jid.split(':')[0].split('@')[0];
    };
    
    return {
        set(lid, pn) {
            if (!lid || !pn) return;
            const lidNorm = normalizeJid(lid);
            const pnNorm = normalizeJid(pn);
            if (lidNorm && pnNorm && /^\d+$/.test(pnNorm)) {
                store.set(lidNorm, pnNorm + '@s.whatsapp.net');
                reverseStore.set(pnNorm, lidNorm + '@lid');
                exports.globalLidMapping.set(lid, pn);
            }
        },
        getPnFromLid(lid) {
            if (!lid) return undefined;
            const lidNorm = normalizeJid(lid);
            return store.get(lidNorm) || exports.globalLidMapping.getPnFromLid(lid);
        },
        getLidFromPn(pn) {
            if (!pn) return undefined;
            const pnNorm = normalizeJid(pn);
            return reverseStore.get(pnNorm) || exports.globalLidMapping.getLidFromPn(pn);
        },
        getAll() {
            const result = {};
            store.forEach((pn, lid) => {
                result[lid] = pn;
            });
            return result;
        }
    };
};
exports.createLidMappingStore = createLidMappingStore;
