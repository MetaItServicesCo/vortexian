// "Other Services": in the Services menu, the "Others" category is one link to this page
// (no sub-dropdown), which lists its services as cards.
export const OTHER_SERVICES_PATH = "/services/other-services";
export const OTHERS = "Others";

// The menu's "Others" group (services with "Show in Services menu" on), as full service
// records from /api/services/, in menu order
export function otherServices(menuTree, services) {
    const group = (Array.isArray(menuTree) ? menuTree : []).find((g) => g.name === OTHERS);
    if (!group) return [];
    const byId = new Map((Array.isArray(services) ? services : []).map((s) => [s.id, s]));
    return group.services.map((s) => byId.get(s.id)).filter(Boolean);
}
