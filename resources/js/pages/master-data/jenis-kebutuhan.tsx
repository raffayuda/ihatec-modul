import MasterDataCategoryPage from '@/components/master-data-category-page';

export default function JenisKebutuhanModul() {
    return (
        <MasterDataCategoryPage
            config={{
                category: 'Jenis Kebutuhan Modul',
                title: 'Jenis Kebutuhan Modul',
                routeSlug: 'master-data/jenis-kebutuhan',
                columns: [{ key: 'name', label: 'Jenis Kebutuhan Modul' }],
            }}
        />
    );
}
