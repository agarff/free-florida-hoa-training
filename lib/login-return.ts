// Only known course and review paths may override the normal home-page return.
export function learningReturn(value:unknown){return typeof value==='string'&&(value==='/suggestions/review'||/^\/self-paced(?:\/[a-z0-9-]+)?$/.test(value))?value:'/'}
