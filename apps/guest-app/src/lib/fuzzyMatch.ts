

export const fuzzyMatch = (text: string, query: string) => {
     const txt = text.toLowerCase()
     const qry = query.toLowerCase()

     if(!qry) return true
     let qryIndex = 0

     for(let i = 0; i < txt.length; i++) {
        if(txt[i] === qry[qryIndex]) {
            qryIndex++
        } 

        if(qryIndex === qry.length) return true
     }

     return false
}