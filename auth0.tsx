function checkIfAdmin(user: any | null){
    try {
        if (user && user.user && user.user.pp_roles && user.user.pp_roles.includes('Admin')) {
            return true;
        }
        return false;
    }
    catch (e) {
        return false;
    }
}

function userHasRole(user: any | null, role: string){
    try {
        if (user && user.user && user.user.pp_roles && user.user.pp_roles.includes(role)) {
            return true;
        }
        return false;
    }
    catch (e) {
        return false;
    }
}

function checkIfLoggedIn(user: any | null){
    try {
        if (user || user.user) {
            return true;
        }
        return false;
    }
    catch (e) {
        return false;
    }
}

export { checkIfAdmin, checkIfLoggedIn, userHasRole };