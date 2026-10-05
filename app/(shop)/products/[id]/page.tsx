import { logger } from '@/utils/logger'


interface PageProps {
    params: Promise<{
        id: string
    }>
}

async function page({ params }: PageProps) {
    const { id } = await params
    logger.debug({ msg: "params" + id })

    // 2. そのままサーバー側で非同期データフェッチができる！
    // const data = await fetch(`https://example.com{id}`).then(res => res.json());

    return (
        <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="p-8">

                <h1 className='text-2xl text-gray-800'>Welcome to Products #{id}</h1>
            </main>
        </div>
    )
}

export default page
