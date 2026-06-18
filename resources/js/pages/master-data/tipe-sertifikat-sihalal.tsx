import MasterDataCategoryPage from '@/components/master-data-category-page';

export default function TipeSertifikatSihalal() {
    return (
        <MasterDataCategoryPage
            config={{
                category: 'Tipe Sertifikat di Sihalal',
                title: 'Tipe Sertifikat di Sihalal',
                routeSlug: 'master-data/tipe-sertifikat-sihalal',
                columns: [{ key: 'name', label: 'Tipe Sertifikat di Sihalal' }],
            }}
        />
    );
}
