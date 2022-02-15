export class SearchResult {
    public name: string;
    public img: string;
    public description: string;
    public km: number;
    public difference: string;
    public duration: string;
    public id:number;
}

export const SEARCHRESULTMOCK: SearchResult[] = [
{
    name: 'Risultato 1',
    img: 'https://picsum.photos/200/100',
    description: 'Esempio di risultato',
    km: 12,
    difference: '300',
    duration: '2:30',
    id:124
},
{
    name: 'Risultato 2',
    img: 'https://picsum.photos/250/100',
    description: 'Secondo Esempio di risultato',
    km: 14,
    difference: '500',
    duration: '3:00',
    id:97
},
{
    name: 'Risultato tre',
    img: 'https://picsum.photos/200/150',
    description: 'Esempio di risultato',
    km: 2,
    difference: '100',
    duration: '0:30',
    id:116
},
{
    name: 'Risultato quattro',
    img: 'https://picsum.photos/300/100',
    description: 'Esempio di risultato',
    km: 25,
    difference: '1300',
    duration: '6:00',
    id:127
}
];
