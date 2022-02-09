echo Deploy con directory?

select withdir in no yes; do
    echo $withdir
    break
done

echo BUILDING...
ng build

if [[ $withdir = yes ]]; then
    echo "COPYING (with directories) "
    scp -r  www/* root@46.101.124.52:~/app.geohub.webmapp.it/
else
    echo "COPYING (only files)"
    scp  www/*.* root@46.101.124.52:~/app.geohub.webmapp.it
    fi