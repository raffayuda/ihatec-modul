import MasterDataCategoryPage from '@/components/master-data-category-page';

export default function PicPeriksaLk() {
    return (
        <MasterDataCategoryPage
            config={{
                category: 'PIC Periksa LK',
                title: 'PIC Periksa LK',
                routeSlug: 'master-data/pic-periksa-lk',
                columns: [{ key: 'name', label: 'PIC Periksa LK' }],
            }}
        />
    );
}
