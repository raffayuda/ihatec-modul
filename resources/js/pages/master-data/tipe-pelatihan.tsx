import MasterDataCategoryPage from '@/components/master-data-category-page';

export default function TipePelatihan() {
    return (
        <MasterDataCategoryPage
            config={{
                category: 'Tipe Pelatihan',
                title: 'Tipe Pelatihan',
                routeSlug: 'master-data/tipe-pelatihan',
                columns: [{ key: 'name', label: 'Tipe Pelatihan' }],
            }}
        />
    );
}
